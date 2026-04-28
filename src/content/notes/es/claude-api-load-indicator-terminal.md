---
draft: false
title: "Construyendo un Indicador de Carga de la API de Claude para tu Terminal"
description: "Cómo construí un plugin zsh para oh-my-zsh que muestra la latencia de la API de Claude directamente en mi prompt de Powerlevel10k — usando un trabajo launchd en segundo plano y una línea base histórica para saber si está lento ahora o es solo tu red."
publishDate: 2026-04-08
cover: ../../../assets/images/claude-api-load-indicator.png
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

Si pasas mucho tiempo en Claude Code o la API de Anthropic, probablemente te has preguntado: *¿está lento ahora, o soy solo yo?* Este post explica cómo construí un pequeño plugin zsh que responde esa pregunta directamente en el prompt del terminal.

## Qué hace

El resultado final es un segmento de Powerlevel10k en el lado derecho de mi prompt que muestra:

| Ícono | Color | Significado |
|-------|-------|-------------|
|  | Verde | API respondiendo con normalidad |
|  | Amarillo | Latencia elevada (línea base + 1σ) |
|  | Rojo | Carga máxima (línea base + 2σ) |
|  | Gris | API inaccesible |

También muestra la latencia en milisegundos. El ícono se actualiza cada minuto automáticamente mediante un job launchd en segundo plano — sin ralentizar el shell, sin consumir tokens.

## Visión general de la arquitectura

Todo está empaquetado como un plugin personalizado de oh-my-zsh con cinco archivos:

```
~/.oh-my-zsh/custom/plugins/claude-status/
├── claude-status.plugin.zsh          # punto de entrada — cargado por oh-my-zsh
├── statusline.sh                     # renderizador del statusline de Claude Code
├── latency-common.sh                 # lector de caché compartido (p10k + statusline)
├── latency-sampler.sh                # script de ping en segundo plano
└── com.giorgiosaud.claude.latency.plist  # plantilla del job de launchd
```

Dos archivos JSON se escriben en tiempo de ejecución:

```
~/.claude/latency_log.json       # historial de 30 días en ventana deslizante
~/.claude/latency_cache.json     # resultado más reciente, leído por el prompt
```

## Parte 1: Medir la latencia

El script sampler (`latency-sampler.sh`) hace un HTTP POST no autenticado a `api.anthropic.com/v1/messages` usando `curl`. El servidor devuelve `401` de inmediato — sin necesidad de API key, sin consumir tokens — pero se ejercita todo el stack TCP + TLS + HTTP:

```bash
curl_time=$(curl -s -o /dev/null -w "%{time_total}" \
  --max-time "$TIMEOUT" \
  -X POST \
  -H "content-type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"claude-haiku-4-5-20251001","max_tokens":1,"messages":[{"role":"user","content":"h"}]}' \
  "https://api.anthropic.com/v1/messages" 2>/dev/null)

if [ $? -eq 0 ] && [ -n "$curl_time" ]; then
  ms=$(python3 -c "print(int(float('$curl_time') * 1000))")
fi
```

Esto mide el stack HTTP completo — handshake TCP, negociación TLS y el time-to-first-byte del servidor — lo que lo convierte en un mejor proxy de la carga de la API que un ping TCP simple.

## Parte 2: Construir una línea base con estadísticas

Una sola medición te dice la latencia actual. Para saber si eso es *rápido o lento*, necesitas contexto. El sampler construye una línea base histórica usando los últimos 30 días de muestras tomadas a la misma hora (±1) en el mismo día de la semana:

```python
samples = [
    e["ms"] for e in log
    if e["weekday"] == current_weekday
    and abs(e["hour"] - current_hour) <= 1
    and e["ts"] != current_ts
    and e["ms"] is not None
]

if len(samples) >= 30:
    baseline = statistics.median(samples)
    stdev = statistics.stdev(samples)
    warn_threshold = baseline + stdev       # ~percentil 84
    peak_threshold = baseline + 2 * stdev  # ~percentil 97.5
```

En lugar de multiplicadores de ratio fijos, los umbrales se expresan en desviaciones estándar desde la mediana. Esto se adapta automáticamente a tu entorno de red — una conexión rápida y una lenta tendrán umbrales apropiadamente diferentes.

### Umbrales de nivel

| Condición | Nivel |
|-----------|-------|
| ms ≤ línea base + σ | normal |
| línea base + σ < ms ≤ línea base + 2σ | warn |
| ms > línea base + 2σ | peak |
| timeout de curl | unavailable |
| menos de 30 muestras | normal (sin indicador de nivel) |

El mínimo de muestras es 30 (no 3) para asegurar que el estimado de desviación estándar sea estable antes de usarlo para decisiones.

### Gestión del log

Cada ejecución agrega una entrada y elimina las de más de 30 días. A intervalos de 1 minuto el log crece rápido, pero la ventana de filtro por día+hora hace que el conjunto de trabajo efectivo para cualquier cálculo de línea base sea mucho menor.

```python
log.append({"ts": now, "ms": ms, "hour": hour, "weekday": weekday})
log = [e for e in log if e["ts"] >= cutoff]  # cutoff = ahora - 30 días
```

## Parte 3: Ejecutarlo en segundo plano con launchd

En macOS, `launchd` es la herramienta correcta para jobs recurrentes en segundo plano. Funciona aunque no haya ningún terminal abierto, sobrevive a reinicios y no requiere cron.

El plugin incluye una plantilla plist con `__SAMPLER_PATH__` y `__HOME__` como marcadores de posición. El sampler corre cada 60 segundos:

```xml
<key>Label</key>
<string>com.giorgiosaud.claude.latency</string>
<key>StartInterval</key>
<integer>60</integer>
<key>RunAtLoad</key>
<true/>
```

El punto de entrada del plugin renderiza la plantilla con las rutas reales y la carga silenciosamente en cada inicio del shell (idempotente — se salta si ya está cargada):

```zsh
sed \
  -e "s|__SAMPLER_PATH__|$_claude_sampler|g" \
  -e "s|__HOME__|$HOME|g" \
  "$_claude_plist_src" > "$_claude_plist_dest"

if ! launchctl list "$_claude_plist_label" &>/dev/null; then
  launchctl bootstrap "gui/$(id -u)" "$_claude_plist_dest" 2>/dev/null \
    || launchctl load "$_claude_plist_dest" 2>/dev/null \
    || true
fi
```

Sin configuración manual necesaria — instala el plugin, recarga el shell y el sampler empieza a correr.

## Parte 4: El lector de caché compartido

Tanto el segmento de Powerlevel10k como el renderizador del statusline necesitan leer el mismo archivo de caché y resolver íconos. En lugar de duplicar esa lógica, un `latency-common.sh` compartido define tres variables de entorno:

```bash
# latency-common.sh
claude_latency_read() {
  CLAUDE_LATENCY_LEVEL=$(jq -r '.level // "normal"' "$CLAUDE_LATENCY_CACHE")
  CLAUDE_LATENCY_MS=$(jq -r '.ms // ""' "$CLAUDE_LATENCY_CACHE")

  case "$CLAUDE_LATENCY_LEVEL" in
    normal)      CLAUDE_LATENCY_ICON=$(printf '\xef\x83\xa7') ;;   # U+F0E7 rayo
    warn)        CLAUDE_LATENCY_ICON=$(printf '\xef\x81\xb1') ;;   # U+F071 alerta
    peak)        CLAUDE_LATENCY_ICON=$(printf '\xef\x88\x9e') ;;   # U+F21E latido
    unavailable) CLAUDE_LATENCY_ICON=$(printf '\xef\xae\xa4') ;;   # U+FBA4 escudo
  esac
}
```

Los íconos se codifican como secuencias de bytes UTF-8 crudas mediante `printf` en lugar de literales embebidos — esto evita el problema de caracteres invisibles de ancho cero que ocurre cuando los editores manglan silenciosamente los codepoints de Nerd Font.

## Parte 5: El segmento de Powerlevel10k

El segmento del prompt usa el lector compartido y colorizado solo de primer plano (sin relleno de fondo — más limpio en terminales transparentes):

```zsh
function prompt_claude_latency() {
  claude_latency_read || return

  local fg
  case "$CLAUDE_LATENCY_LEVEL" in
    normal)      fg=76  ;;   # verde   (coincide con VCS_CLEAN)
    warn)        fg=178 ;;   # amarillo (coincide con VCS_MODIFIED)
    peak)        fg=160 ;;   # rojo    (coincide con STATUS_ERROR)
    unavailable) fg=66  ;;   # gris    (coincide con TIME)
  esac

  if [[ -n "$CLAUDE_LATENCY_MS" && "$CLAUDE_LATENCY_MS" != "null" ]]; then
    p10k segment -f $fg -i "$CLAUDE_LATENCY_ICON" -t "${CLAUDE_LATENCY_MS}ms"
  else
    p10k segment -f $fg -i "$CLAUDE_LATENCY_ICON"
  fi
}
```

El segmento se auto-registra mediante un hook `precmd` — no se requiere editar `.p10k.zsh` manualmente:

```zsh
function _claude_status_register() {
  if (( ${#POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS} )); then
    if [[ ${POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS[(Ie)claude_latency]} -eq 0 ]]; then
      POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS+=(claude_latency)
    fi
    add-zsh-hook -d precmd _claude_status_register
    unfunction _claude_status_register
  fi
}
autoload -Uz add-zsh-hook
add-zsh-hook precmd _claude_status_register
```

El hook se dispara una vez en el primer prompt, agrega el segmento y luego se elimina a sí mismo.

> **Nota sobre colores:** Usar números literales de 256 colores con `-f`, no variables. Pasar variables `$POWERLEVEL9K_*` a `p10k segment` no funciona para segmentos personalizados.

## Parte 6: El statusline de Claude Code

El statusline integrado de Claude Code muestra el uso de la ventana de contexto y los límites de tasa. El plugin agrega un statusline más completo que integra todo esto junto con el indicador de latencia, la rama de git y el nombre del modelo:

```bash
# Lee el JSON que Claude Code envía por stdin
cwd=$(echo "$input"    | jq -r '.workspace.current_dir // .cwd // ""')
model=$(echo "$input"  | jq -r '.model.display_name // ""')
used_pct=$(echo "$input" | jq -r '.context_window.used_percentage // empty')
five_pct=$(echo "$input" | jq -r '.rate_limits.five_hour.used_percentage // empty')
```

Las barras de progreso se renderizan en bash puro:

```bash
make_bar() {
  local pct=$1
  local filled=$(( pct * 10 / 100 ))
  local empty=$(( 10 - filled ))
  local bar="" i
  for (( i=0; i<filled; i++ )); do bar="${bar}█"; done
  for (( i=0; i<empty;  i++ )); do bar="${bar}░"; done
  printf "%s" "$bar"
}
```

La línea final se ve así:

```
user@host  ~/projects/myapp  main  claude-sonnet-4-6 |  [████████░░] 82% |  [███░░░░░░░] 31% |  45ms
```

Registrarlo con el helper incluido:

```zsh
claude-status-register
```

Esto escribe la clave `statusLine` en `~/.claude/settings.json` automáticamente mediante `jq`.

## Problemas que encontré

**Los bytes de Nerd Font no se escribían correctamente.** Cuando el agente escribió los codepoints de íconos en el script de shell, se almacenaban como caracteres invisibles de ancho cero. La solución fue usar `printf '\xNN\xNN\xNN'` con secuencias de bytes UTF-8 explícitas en lugar de embeber los caracteres directamente.

**Los colores del segmento p10k necesitan números literales.** Pasar variables a `-f` o `-b` no funciona para segmentos personalizados. Usar números literales de 256 colores: `-f 76`.

**Colorizado de fondo vs. primer plano.** Usar `-b` (relleno de fondo) se ve recargado en fondos de terminal transparentes. Solo primer plano (`-f`) se integra mejor y aún coincide con la paleta de colores estándar de p10k.

**`/dev/tcp` es poco confiable para medir tiempos en bash.** `curl -w "%{time_total}"` es preciso y portable entre versiones de bash de macOS.

**El ping TCP subestima la carga de la API.** Un handshake TCP simple con `nc` solo mide el RTT de red — no refleja la negociación TLS ni el tiempo de procesamiento del servidor. El enfoque con `curl` captura el stack completo y correlaciona mucho mejor con la latencia real de la API bajo carga.

## Instalación

1. Clonar o copiar el plugin en `~/.oh-my-zsh/custom/plugins/claude-status/`
2. Agregar `claude-status` a la lista `plugins=(...)` en el zshrc
3. Ejecutar `exec zsh` — el job de launchd y el segmento de p10k se instalan solos
4. Para agregar el statusline de Claude Code: ejecutar `claude-status-register` en el terminal

Después de ~60 segundos (RunAtLoad se dispara), `~/.claude/latency_cache.json` existirá y tanto el segmento de p10k como el statusline mostrarán datos en vivo.

## Qué sigue

- **Texto ms con color** — amarillo/rojo en el valor de ms cuando la latencia supera los umbrales, incluso antes de tener una línea base completa
- **Gráfico histórico** — comando `claude-latency-history` para visualizar el log histórico en el terminal
- **Notificación en pico** — alerta de `osascript` cuando el ratio supera 2σ durante trabajo activo
