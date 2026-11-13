---
draft: false
title: "anchor-scope + position-try-fallbacks: el bug de Chrome que ancló mis tooltips al elemento equivocado"
description: "Intenté eliminar el naming por instancia del tooltip de mi design system usando anchor-scope. Funcionó hasta que entró una posición de fallback — y ahí los tooltips empezaron a anclarse a un trigger completamente distinto."
publishDate: 2026-08-13
cover: ../../../assets/images/css-anchor-positioning.png
coverAlt: Un tooltip anclado al trigger equivocado, con una línea de anclaje rota cruzando entre dos botones
selfHealing: nchrsc
lang: es
category: Development
author: 000001-jorge-saud
collections:
  - css
  - frontend
tags:
  - css
  - anchor-positioning
  - tooltips
  - chrome
  - "2026"
---

Quería eliminar una API.

El tooltip de mi design system soporta CSS Anchor Positioning, pero solo si haces opt-in por instancia. Tienes que colgarle tú mismo un dashed-ident único al wrapper:

```html
<span class="bp-tooltip-wrap" style="--tooltip-anchor: --save-tip">
  <button>Guardar</button>
  <span class="bp-tooltip">Guarda sin cerrar</span>
</span>
```

Ese `--save-tip` es puro trámite. El consumidor tiene que inventarse un nombre, mantenerlo único en toda la página y acordarse de ponerlo — y si se le olvida, el tooltip cae en silencio a `position: absolute` y el primer ancestro con `overflow: hidden` lo recorta. Todo design system tiene un par de estas heridas pequeñas donde la implementación se filtra hacia la API. Yo tenía cómo cerrar esta, así que fui.

Si primero necesitas las bases de cómo funciona el anclaje, eso lo escribí en [CSS Anchor Positioning](https://www.giorgiosaud.io/notebook/css-anchor-positioning-cssnch). Este post va de lo que pasa cuando lo empujas un paso más allá de lo que el navegador está listo para dar.

## La idea: un nombre compartido, re-scopeado por instancia

`anchor-scope` existe exactamente para esto. Limita la visibilidad de un `anchor-name` a un subárbol, así que el mismo nombre se puede reutilizar por toda la página sin colisiones. Cada wrapper se convierte en su propio universo:

```css
.bp-tooltip-wrap {
  anchor-scope: --bp-tooltip-anchor;
}

.bp-tooltip-wrap > :first-child {
  anchor-name: --bp-tooltip-anchor;
}

.bp-tooltip {
  position: fixed;
  position-anchor: --bp-tooltip-anchor;
  bottom: calc(anchor(top) + var(--_offset) * -1);
  inset-inline-start: anchor(center);
  translate: -50% -100%;
}
```

Un nombre, declarado una sola vez, scopeado a cada wrapper. Sin estilos inline, sin naming, sin manera de que el consumidor lo haga mal. La API desaparece y la funcionalidad se queda.

Y funciona. Haz hover sobre cualquier tooltip aislado y cae exactamente donde debe, escapa del `overflow: hidden` y se renderiza por encima de todo. Estaba listo para mandarlo a producción.

## Dónde se rompe

El tooltip también tiene posiciones de fallback, para que voltee en vez de salirse del viewport:

```css
.bp-tooltip {
  position-try-fallbacks: --bp-tooltip-bottom, --bp-tooltip-end, --bp-tooltip-start;
}

@position-try --bp-tooltip-bottom {
  bottom: auto;
  top: calc(anchor(bottom) + var(--_offset));
  translate: -50% 0;
}
```

Esa combinación es donde se cae todo. **Cuando entra una posición de fallback, el tooltip se puede anclar al trigger de otra instancia en cualquier otra parte de la página.**

No desviado por unos píxeles. Anclado al elemento equivocado, punto — un tooltip flotando al lado de un botón que no tiene nada que ver con él.

Lo encontré en el peor lugar posible: el preview "All placements" de mi propia documentación, que renderiza cuatro tooltips lado a lado para demostrar top / bottom / start / end. Es el único sitio de la página donde varias instancias quedan lo bastante cerca como para estorbarse, así que varias entran en sus fallbacks al mismo tiempo. Dos tooltips visibles a la vez, uno de ellos estacionado junto al trigger de un desconocido.

Lo gracioso es que ese es justo el escenario que la página de docs existe para mostrar. Si solo hubiera probado un tooltip a la vez — que es lo que uno hace cuando está verificando si un tooltip funciona — lo habría mandado a producción y habría dejado que alguien más descubriera esto dentro de su propio producto.

## Por qué creo que pasa

No puedo señalar una línea del spec y darlo por cerrado, así que tómalo como teoría de trabajo: el re-scopeo de `anchor-scope` no sobrevive de forma confiable a la evaluación de fallbacks de `@position-try` en Chrome 150.

Se siente como un problema de orden. La evaluación de fallbacks vuelve a resolver la posición del elemento contra su ancla, y en algún punto de esa re-resolución el nombre scopeado resuelve contra el subárbol equivocado — el `anchor-name` compartido es genuinamente ambiguo en ese momento, y el scope que debía desambiguarlo no está aplicado. En qué instancia caes es básicamente suerte.

Ambas features son recientes. Anchor Positioning y `anchor-scope` llegaron como "newly available" en Baseline 2025. Por separado son sólidas y las uso en producción. Lo que está crudo es la intersección, y una intersección es justo el tipo de cosa de la que nada te avisa por adelantado.

## Cómo comprobarlo tú mismo

Si estás construyendo sobre `anchor-scope`, el repro toma un minuto:

1. Renderiza **dos o más** instancias ancladas cerca una de otra, no una sola.
2. Dales `position-try-fallbacks` y apriétalas contra un borde del viewport para que un fallback entre de verdad.
3. Haz hover en cada una y observa a dónde se va la otra.

La condición a vigilar es el cross-anchoring: un elemento anclándose al trigger de una instancia hermana. Si con una sola instancia todo se queda quieto y solo se porta mal cuando hay varias cerca, ese es este bug, no tu CSS.

Probar una instancia en una página limpia no demuestra nada aquí. Este fallo necesita vecinos.

## Qué mandé en su lugar

Volví al patrón opt-in. El consumidor sigue escribiendo su propio nombre único:

```css
@supports (anchor-name: --x) {
  .bp-tooltip-wrap:has(> [style*="--tooltip-anchor"]) {
    > :first-child {
      anchor-name: var(--tooltip-anchor);
    }
  }

  .bp-tooltip-wrap:has(> [style*="--tooltip-anchor"]) .bp-tooltip {
    position: fixed;
    position-anchor: var(--tooltip-anchor);
    bottom: calc(anchor(top) + var(--_offset) * -1);
    inset-inline-start: anchor(center);
    translate: -50% -100%;
    position-try-fallbacks: --bp-tooltip-bottom, --bp-tooltip-end, --bp-tooltip-start;
    z-index: unset;
  }
}
```

Más verboso, más feo, y correcto. Cada instancia tiene un nombre genuinamente distinto, así que no queda ambigüedad que el paso de fallback pueda resolver mal.

También dejé la razón dentro del stylesheet en vez de en un mensaje de commit, porque el próximo que vea este archivo voy a ser yo dentro de seis meses, preguntándome por qué no está la versión automática:

```css
/*
 * Tried making this automatic via `anchor-scope` (one shared
 * anchor-name re-scoped per .bp-tooltip-wrap) so no naming would be
 * needed — but verified in Chrome 150 that anchor-scope combined with
 * position-try-fallbacks cross-contaminates between sibling tooltip
 * instances once a fallback position engages: a tooltip can render
 * anchored to a *different* trigger's position. Reverted to explicit
 * per-instance names until that engine interaction is reliable.
 */
```

Un approach revertido sin explicación es una invitación a intentarlo otra vez y perder la misma tarde.

## Lo que queda

Baseline te dice que una feature está disponible. No te dice que dos features recién disponibles componen entre sí.

Y no es un reclamo contra Baseline — responde honestamente la pregunta para la que fue construido, feature por feature. Pero "Chrome 125+, soporte completo" para Anchor Positioning y "newly available" para `anchor-scope` son dos promesas separadas, y ninguna de las dos cubre qué pasa cuando una posición de fallback vuelve a resolver un anchor name scopeado. Nadie publica una matriz de soporte para intersecciones de features. No hay fila para eso.

Así que cuando tu diseño dependa de que dos features jóvenes se encuentren, prueba el punto de encuentro específicamente, con suficientes instancias en la página como para que el camino interesante del código se ejecute. El bug que buscas no va a aparecer en el demo limpio y aislado. Aparece en la página de docs donde pusiste todo lado a lado para lucirte — que, si tienes suerte como la tuve yo, es una página que te pertenece.

> **Estado**: verificado roto en Chrome 150, julio de 2026. Si estás leyendo esto más adelante y la interacción del motor ya está arreglada, vale la pena volver a mirar la versión automática — solo corre el test de dos instancias antes de confiar en ella.
