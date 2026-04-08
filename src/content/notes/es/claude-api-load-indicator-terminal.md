---
draft: false
title: "Construyendo un Indicador de Carga de la API de Claude para tu Terminal"
description: "Cómo construí un plugin zsh para oh-my-zsh que muestra la latencia de la API de Claude directamente en mi prompt de Powerlevel10k — usando un trabajo launchd en segundo plano y una línea base histórica para saber si está lento ahora o es solo tu red."
publishDate: 2026-04-08
cover: ../../../assets/images/home-notebook.webp
coverAlt: Terminal mostrando el indicador de carga de la API de Claude
selfHealing: bldngc
lang: es
category: devops
author: giorgio-saud
collections:
  - architecture
tags:
  - terminal
  - zsh
  - shell
  - claude
  - ai
  - devops
  - "2026"
---

Si pasas mucho tiempo en Claude Code o usando la API de Anthropic directamente, probablemente te has preguntado: *¿está lento ahora, o soy solo yo?* Me cansé de adivinar y construí un pequeño plugin zsh que responde esa pregunta directamente en el prompt del terminal.

> **Un aviso antes de continuar:** esto es un workaround, no una solución. Lo ideal sería que Anthropic expusiera datos de carga en tiempo real — un endpoint de estado con señales reales de saturación o degradación, el tipo de cosa que esperarías de una plataforma de API madura. Hasta que eso exista, inferir la carga a partir del tiempo de handshake TCP es lo mejor que podemos hacer desde afuera. Es imperfecto: no puede distinguir congestión de red de carga del servidor, y una línea base vacía es simplemente ruido. Pero "imperfecto y visible" le gana a "sin información alguna", así que aquí está cómo lo construí.

## Qué hace

El resultado es un segmento de Powerlevel10k en el lado derecho de mi prompt que muestra la carga actual de la API:

| Ícono | Color | Significado |
|-------|-------|-------------|
| ⚡ | Verde | API respondiendo con normalidad |
| ⚠ | Amarillo | Latencia elevada (1.4× la línea base) |
| ❤ | Rojo | Carga máxima (2× la línea base) |
| 🛡 | Gris | API inaccesible |

También muestra la latencia en milisegundos. El ícono se actualiza cada 15 minutos mediante un trabajo launchd en segundo plano — sin ralentizar el shell, sin consumir tokens.

## Visión general de la arquitectura

Todo está empaquetado como un plugin personalizado de oh-my-zsh con cuatro archivos:

```
~/.oh-my-zsh/custom/plugins/claude-status/
├── claude-status.plugin.zsh     # punto de entrada — cargado por oh-my-zsh
├── statusline.sh                # renderizador del statusline de Claude Code
├── latency-sampler.sh           # script de ping en segundo plano
└── com.claude.latency.plist     # plantilla del job de launchd
```

Dos archivos JSON se escriben en tiempo de ejecución:

```
~/.claude/latency_log.json       # historial de 7 días en ventana deslizante
~/.claude/latency_cache.json     # resultado más reciente, leído por el prompt
```

El prompt solo lee `latency_cache.json` — un archivo pequeño escrito por el job en segundo plano. Sin bloqueos, sin esperas.

## Parte 1: Medir la latencia sin usar la API

El script sampler hace un handshake TCP a `api.anthropic.com:443` usando `nc` y mide el tiempo de ida y vuelta en milisegundos:

```bash
start=$(python3 -c "import time; print(int(time.time()*1000))")
if nc -z -w 10 api.anthropic.com 443 2>/dev/null; then
  end=$(python3 -c "import time; print(int(time.time()*1000))")
  ms=$(( end - start ))
fi
```

Esto mide el tiempo de red + negociación TLS — un buen proxy de la carga de la API sin hacer ninguna llamada real (y por lo tanto consumiendo cero tokens). No capturará todo tipo de lentitud, pero sí captura la que importa: el servidor bajo carga en el borde de la red.

## Parte 2: Construir una línea base con significado

Una sola medición te dice la latencia actual. Para saber si eso es *rápido o lento*, necesitas contexto. El sampler construye una línea base histórica usando los últimos 7 días de muestras tomadas a la misma hora (±1) en el mismo día de la semana:

```python
samples = [
    e["ms"] for e in log
    if e["weekday"] == current_weekday
    and abs(e["hour"] - current_hour) <= 1
    and e["ts"] != current_ts
]

if len(samples) >= 3:
    baseline = statistics.median(samples)
    ratio = current_ms / baseline
```

Usar la **mediana** en lugar de la media evita los valores atípicos — un único pico no infla la línea base. La ventana de día de semana + hora contempla los patrones de tráfico predecibles; el martes por la tarde se ve muy diferente al domingo por la mañana.

### Umbrales de nivel

| Ratio vs línea base | Nivel |
|---------------------|-------|
| < 1.4× | normal |
| 1.4× – 2× | warn |
| ≥ 2× | peak |
| Timeout TCP | unavailable |

Hasta que existan 3 muestras para la ventana de tiempo actual, solo se muestra el valor en ms sin indicador de nivel. Mejor no mostrar nada que mostrar algo engañoso.

### Gestión del log

Cada ejecución agrega una entrada y elimina las entradas de más de 7 días. A intervalos de 15 minutos son un máximo de ~672 entradas (~35KB) — una ventana deslizante de tamaño fijo que no crece indefinidamente:

```python
log.append({"ts": now, "ms": ms, "hour": hour, "weekday": weekday})
log = [e for e in log if e["ts"] >= cutoff]  # cutoff = ahora - 7 días
```

## Parte 3: Ejecutarlo en segundo plano con launchd

En macOS, `launchd` es la herramienta correcta para jobs recurrentes en segundo plano. Funciona aunque no haya ningún terminal abierto, sobrevive a reinicios y no requiere cron.

El plugin incluye una plantilla plist con `__SAMPLER_PATH__` y `__HOME__` como marcadores de posición:

```xml
<key>StartInterval</key>
<integer>900</integer>   <!-- 15 minutos -->
<key>RunAtLoad</key>
<true/>                  <!-- ejecutar una vez inmediatamente al instalar -->
```

El punto de entrada del plugin renderiza la plantilla con las rutas reales y la carga en cada inicio del shell — de forma idempotente, saltándose la carga si ya está registrada:

```zsh
sed \
  -e "s|__SAMPLER_PATH__|$_claude_sampler|g" \
  -e "s|__HOME__|$HOME|g" \
  "$_claude_plist_src" > "$_claude_plist_dest"

if ! launchctl list "com.claude.latency" &>/dev/null; then
  launchctl bootstrap "gui/$(id -u)" "$_claude_plist_dest" 2>/dev/null
fi
```

Sin configuración manual necesaria. Instala el plugin, recarga el shell y el sampler empieza a correr. Después de ~15 segundos `~/.claude/latency_cache.json` existe y el segmento aparece.

## Parte 4: El segmento de Powerlevel10k

El segmento del prompt lee `latency_cache.json` y llama a `p10k segment` con el ícono y color correspondiente. La lección clave aquí: usar `-i` para el ícono y pasar los números de color directamente — no pasar variables:

```zsh
function prompt_claude_latency() {
  local cache="$HOME/.claude/latency_cache.json"
  [[ -f "$cache" ]] || return

  local level ms icon fg bg
  level=$(jq -r '.level // "normal"' "$cache" 2>/dev/null) || return
  ms=$(jq -r '.ms // ""' "$cache" 2>/dev/null)

  case "$level" in
    normal)      icon=$'\uf0e7'; fg=0; bg=2 ;;   # rayo,    negro sobre verde
    warn)        icon=$'\uf071'; fg=0; bg=3 ;;   # alerta,  negro sobre amarillo
    peak)        icon=$'\uf21e'; fg=0; bg=1 ;;   # pulso,   negro sobre rojo
    unavailable) icon=$'\ufba4'; fg=0; bg=7 ;;   # escudo,  negro sobre gris
    *)           return ;;
  esac

  if [[ -n "$ms" && "$ms" != "null" ]]; then
    p10k segment -b $bg -f $fg -i "$icon" -t "${ms}ms"
  else
    p10k segment -b $bg -f $fg -i "$icon"
  fi
}
```

Registrarlo en `~/.p10k.zsh`:

```zsh
typeset -g POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS=(
  # ... segmentos existentes ...
  claude_latency
)
```

Luego `p10k reload` para activarlo sin reiniciar el shell.

> **Requisito de fuente:** Los íconos de Nerd Font requieren una fuente parcheada. MesloLGS NF (la predeterminada de Powerlevel10k) funciona perfectamente — todos los codepoints usados están en el rango de Font Awesome v4 / Powerline.

## Parte 5: El statusline de Claude Code

Claude Code tiene un statusline integrado que muestra el uso de la ventana de contexto y los límites de tasa. El plugin también incluye un renderizador que agrega el indicador de latencia ahí, leyendo el mismo archivo de caché:

```bash
if [ -f "$CACHE" ]; then
  level=$(jq -r '.level' "$CACHE")
  ms=$(jq -r '.ms // ""' "$CACHE")
  # ... elegir ícono según nivel ...
  latency_segment=" | ${icon} ${ms}ms"
fi
```

Así obtienes la misma información tanto en el prompt como dentro de una sesión de Claude Code.

## Problemas que encontré

**Los bytes de Nerd Font no se escribían correctamente.** Cuando el agente escribió los codepoints de íconos en el script de shell, se almacenaban como caracteres invisibles de ancho cero. La solución fue escribir el archivo con Python e incrustar el Unicode directamente:

```python
with open('statusline.sh', 'w', encoding='utf-8') as f:
    f.write(script)  # el script contiene los caracteres \uf0e7 etc. reales
```

**Los colores del segmento p10k necesitan números literales.** Pasar variables a `-b` no funciona para segmentos personalizados. Usar números literales: `-b 2 -f 0`.

**`/dev/tcp` es poco confiable en bash para medir tiempos.** Usar `nc -z -w $TIMEOUT` es más limpio y funciona de forma consistente en las versiones de bash de macOS.

## Instalación

1. Clonar o copiar el plugin en `~/.oh-my-zsh/custom/plugins/claude-status/`
2. Agregar `claude-status` a la lista `plugins=(...)` en `~/.zshrc`
3. Agregar `claude_latency` a `POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS` en `~/.p10k.zsh`
4. Ejecutar `exec zsh && p10k reload`

El job de launchd se instala solo. Después de ~15 segundos (RunAtLoad se dispara), el archivo de caché existirá y el segmento aparecerá.

## Qué sigue

Algunas cosas que quiero agregar:

- **Texto ms con color** — amarillo/rojo cuando la latencia supera los umbrales incluso sin una línea base completa aún
- **Gráfico histórico** — un comando `claude-latency-history` para visualizar el log histórico en el terminal
- **Notificación en pico** — alerta de `osascript` cuando el ratio supera 2× durante sesiones de trabajo activas

Es algo pequeño, pero tener esta información de forma ambiental en el prompt ha cambiado genuinamente cómo interpreto el tiempo de respuesta de Claude. Cuando se siente lento, ahora sé de un vistazo si es mi máquina, mi conexión, o la propia API.
