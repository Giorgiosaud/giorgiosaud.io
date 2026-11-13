---
draft: false
title: "La cuarentena de pnpm 11: por qué `pnpm outdated` esconde versiones y forzar una abre agujeros"
description: "pnpm 11 se niega a instalar cualquier cosa publicada en las últimas 24 horas. Es un buen default contra ataques de supply chain, con dos efectos sorprendentes: pnpm outdated miente en silencio sobre cuál es la 'latest', y forzar una versión fresca escribe excepciones en la configuración del workspace."
publishDate: 2026-11-13
cover: ../../../assets/images/pnpm-minimum-release-age-quarantine.webp
coverAlt: "Cajas de paquetes esperando tras una barrera de cuarentena con un reloj, mientras una caja atraviesa a la fuerza un agujero en la barrera"
selfHealing: pnpm11
lang: es
category: DevOps
author: giorgio-saud
collections:
  - security
  - frontend
tags:
  - pnpm
  - supply-chain
  - seguridad
  - dependencias
  - "2026"
---

Estaba haciendo un bump rutinario de dependencias en un proyecto y dos cosas parecían bugs.

`pnpm outdated` decía que la versión "latest" de un paquete era una que yo sabía que ya estaba una release atrás. Y después de forzar la versión nueva, el diff incluía un archivo que yo no había tocado: a `pnpm-workspace.yaml` le habían salido dieciséis líneas nuevas.

Ninguna de las dos era un bug. Las dos eran pnpm 11 haciendo exactamente lo que fue diseñado para hacer, y me costó un rato verlo.

## La feature: una cuarentena de 24 horas

Desde pnpm 11, `minimumReleaseAge` tiene por defecto `1440` minutos. pnpm no resuelve una versión publicada hace menos de un día.

El razonamiento es sólido. La ola reciente de ataques de supply chain en npm sigue el mismo patrón: alguien toma control de la cuenta de un maintainer, publica una versión maliciosa, y la comunidad la detecta y la retira en cuestión de horas. Si tu instalación espera un día, te saltas casi toda esa ventana sin hacer nada.

Es un buen default. También cambia cómo se comportan dos comandos de todos los días.

## Sorpresa 1: `pnpm outdated` esconde la cuarentena

`pnpm outdated` solo reporta versiones *instalables bajo tu política actual*. Una versión publicada hace tres horas no lo es, así que para `outdated` no existe. Ves la versión anterior marcada como latest, y nada te avisa que hay una más nueva esperando.

Así terminas pensando que el caché del registry está viejo, que el paquete no se publicó de verdad o que tu lockfile miente.

Para ver la latest real del registry, pregúntale directamente:

```bash
pnpm view <paquete> version
pnpm view <paquete> time --json | tail -5   # fechas de publicación, para ver qué tan fresca es
```

Si `pnpm view` muestra una versión más nueva que `pnpm outdated`, y tiene menos de un día, encontraste la cuarentena.

## Sorpresa 2: forzar una versión escribe excepciones

El siguiente paso obvio es forzarla:

```bash
pnpm up some-sdk@3.1102.0
```

Funciona. Y pnpm registra en silencio una excepción por cada paquete que tuvo que dejar pasar, en `minimumReleaseAgeExclude`:

```yaml
# pnpm-workspace.yaml
minimumReleaseAgeExclude:
  - some-sdk@3.1102.0
  - '@some-sdk/core@3.1102.0'
  - '@some-sdk/middleware-retry@3.1102.0'
  # ...una entrada por cada dependencia transitiva fresca
```

Un SDK modular publica todos sus paquetes juntos, así que un solo bump trajo dieciséis paquetes transitivos frescos y dieciséis excepciones.

Mira lo que significa. La cuarentena existe para exactamente un escenario: *una versión publicada hace horas podría ser maliciosa*. Forzar un upgrade rutinario se salta el control en ese mismo escenario, para cada paquete del árbol, y no deja más rastro que un diff de YAML fácil de aprobar sin mirar en el review.

## La parte de arqueología

Cuando revisé la lista `minimumReleaseAgeExclude` que ya existía en ese repo, tenía entradas: un test runner, un CLI de deploy, algunas más. Nadie recordaba haberlas agregado.

`git log` mostró que todas entraron con el commit que subió pnpm a v11. No eran excepciones deliberadas. Eran el mismo bypass automático, escrito la primera vez que alguien instaló justo después de que se activara la cuarentena y pnpm se encontró con versiones que todavía estaban frescas.

O sea, la lista que se supone documenta "paquetes en los que confiamos antes de tiempo, a conciencia" era mayormente accidental.

## Lo que hago ahora

**Cuando un bump parece "faltar":** revisa `pnpm view` antes de concluir nada. Casi siempre la respuesta es que la versión tiene pocas horas.

**Cuando `pnpm-workspace.yaml` cambia durante un bump de dependencias:** tómalo como señal para retroceder, no como algo para commitear. Revierte el archivo, deja de forzar la versión y vuelve a hacer el bump mañana. Esperar un día no cuesta nada en un upgrade rutinario.

**Cuando una excepción se justifica:** hay un caso real, y es un fix de seguridad que necesitas ya. `pnpm audit --fix` lo hace de forma explícita, agregando la versión parcheada mínima a la lista de exclusión. Esa es una excepción deliberada y revisable. Fíjala a la versión exacta, explica el porqué en el mensaje del commit y quítala cuando la versión salga de la cuarentena.

**Limpia las accidentales.** Cualquier entrada en `minimumReleaseAgeExclude` cuya versión ya tiene días no protege ni salta nada. Solo es ruido que hace más difícil ver la próxima excepción deliberada.

**En el review:** un PR titulado "bump dependencies" no debería tocar `minimumReleaseAgeExclude`. Si lo hace, pregunta por qué.

## La lección general

Los controles de supply chain fallan como fallan la mayoría de los controles de seguridad. Nadie los apaga. Se los salta una excepción conveniente a la vez, y cada excepción parece razonable por separado.

pnpm hizo que el comportamiento seguro fuera el default, que es la parte difícil. Lo demás es darte cuenta cuando una herramienta escribe una excepción por ti y negarte a commitearla.

> **Revisión rápida para tu repo:** `grep -A50 minimumReleaseAgeExclude pnpm-workspace.yaml`. Por cada entrada, ¿puedes decir quién la agregó y por qué?
