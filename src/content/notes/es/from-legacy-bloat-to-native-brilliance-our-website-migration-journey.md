---
draft: false
selfHealing: FLBTNB
title: "Transformación Web: De Código Legado a Innovación"
description: Descubre cómo transformé mi aplicación web de código legado a innovaciones nativas, mejorando rendimiento y accesibilidad en el proceso.
publishDate: 2025-07-13
category: frontend
author: 000001-jorge-saud
collections:
  - frontend
  - patterns
tags:
  - evolución
  - frontend
cover: ../../../assets/images/from-legacy-bloat-to-native-brilliance-our-website-migration-journey_fuemvo.webp
coverAlt: Cables y enredos a simpleza led
slug: de-la-carga-del-legado-a-la-brillantez-nativa-mi-viaje-de-migracion-web
---

Durante el último año, emprendí una misión que muchos desarrolladores conocen pero a menudo temen: refactorizar mi aplicación web. El proyecto, este cuaderno y portal en el sector del conocimiento de desarrolladores, estaba cargado con meses de deuda técnica acumulada, frameworks pesados y muchas refactorizaciones que me llevaron a realizar la definitiva. Mi objetivo era claro: migrar a características modernas y nativas de CSS y HTML para construir una plataforma más rápida, más mantenible y altamente accesible para el futuro.

Esta es la historia de mi viaje: las herramientas que adopté, los desafíos que enfrenté y los resultados gratificantes.

Aquí resumiré la experiencia y en los próximos días publicaré aprendizajes más específicos de este viaje.

## Por Qué Tuve Que Abandonar las Viejas Formas

Los códigos legado tienen una forma de acumularse. Lo que comienza como un simple plugin de jQuery aquí y un framework de CSS allá eventualmente se convierte en una compleja red de dependencias.

En mi caso, no llegué a un punto crítico debido a problemas de rendimiento o mantenimiento. Más bien, lo que me motivó fue la curiosidad y las ganas de experimentar con las nuevas funcionalidades nativas de la web. Quería ver de primera mano cómo las últimas capacidades de CSS y HTML podían mejorar mi proceso de desarrollo y la experiencia del usuario.

## Mi Nuevo Conjunto de Herramientas: Adoptando Funcionalidades Nativas

La plataforma web moderna ofrece alternativas poderosas a las herramientas que solía usar. Estas son las características clave que transformaron mi código.

### 1. Consultas de Contenedor en CSS: El Sueño de la Verdadera Modularidad

Las consultas de contenedor fueron el mayor cambio para mi interfaz de usuario. Anteriormente, mi diseño responsivo dependía completamente del viewport. Un componente podía verse genial en una pantalla "móvil", pero romperse cuando se colocaba en una barra lateral estrecha en una pantalla "de escritorio".

Con las consultas de contenedor, los componentes se adaptan al tamaño de su *padre*. Mis widgets de tablero ahora son verdaderamente autónomos. El mismo componente de widget puede renderizar una vista compacta en una barra lateral de 300px y una vista detallada y expandida en un área de contenido principal de 900px, todo sin una sola línea de JavaScript.

```css
.widget-container {
  container-type: inline-size;
  container-name: widget;
}

.widget-header {
  /* Estilos predeterminados */
}

/* Si el contenedor es más ancho que 400px, cambia el diseño */
@container widget (min-width: 400px) {
  .widget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
```

### 2. El Selector :has(): Un Superpoder de CSS

Apodado el "selector padre", ```:has()``` me permitió eliminar scripts complejos de alternancia de clases. Ahora puedo estilizar un elemento basado en sus hijos o estado, lo que lleva a un CSS más limpio y declarativo.

Un caso de uso perfecto fue la validación de formularios. Ahora puedo estilizar todo el contenedor de un campo de formulario para indicar un error, simplemente verificando si contiene un input con un estado ```:invalid```.

```css
/* Resaltar todo el campo de formulario si el input dentro es inválido */
.form-field:has(input:invalid) {
  border-color: red;
  background-color: #fff8f8;
}

/* Agregar un banner "destacado" a una tarjeta solo si contiene la insignia */
.card:has(.badge--featured) {
  border-left: 4px solid gold;
}
```

### 3. ```<dialog>``` y ```<popover>``` Nativos: Accesibilidad Incorporada

Mis modales personalizados eran una fuente constante de errores de accesibilidad. El enfoque de trampa, la navegación por teclado (Esc para cerrar) y los roles ARIA adecuados eran frágiles y difíciles de mantener.

Reemplazarlos con el elemento nativo ```<dialog>``` y el nuevo atributo ```popover``` fue una revelación. Eliminé cientos de líneas de JavaScript. El navegador ahora maneja todas las interacciones complejas de accesibilidad por mí, asegurando que mis modales y ventanas emergentes sean robustos y compatibles por defecto.

### 4. Mejoras en Formularios: Una Mejor Experiencia de Usuario

Reformé mis formularios utilizando atributos modernos de HTML. Esto redujo mi dependencia de scripts personalizados y hizo que mis formularios fueran más amigables y seguros.

```inputmode```: Mostrar el teclado correcto en dispositivos móviles (por ejemplo, numérico para un campo PIN) redujo significativamente la fricción del usuario.

```autocomplete```: Usar valores de autocompletar estandarizados ayudó a los usuarios a completar formularios más rápido con la información almacenada en su navegador.

*Validación Incorporada*: Aproveché los atributos de validación nativos de HTML5 como required, pattern y minlength para obtener comentarios instantáneos, simplificando enormemente mi lógica de validación.

## Mi Proceso de Migración

Una reescritura completa no era una opción. Seguí un proceso gradual y estratégico:

Auditoría: Identifiqué áreas clave donde las soluciones pesadas y heredadas podían ser reemplazadas por una funcionalidad nativa ligera. Priorizé componentes de alto tráfico y puntos críticos de accesibilidad.

Refactorización: Reemplacé de manera incremental polyfills y componentes antiguos. Para características críticas, a menudo utilicé un enfoque de mejora progresiva, asegurando una experiencia básica mientras proporcionaba la versión mejorada a los usuarios en navegadores modernos.

Pruebas: Utilicé tablas de compatibilidad de navegadores extensivamente y realicé pruebas en dispositivos reales para validar mis nuevas implementaciones en los navegadores que soportaba, prestando especial atención a los retrocesos necesarios.

Educación: Esto fue un cambio cultural. Documenté los nuevos estándares, realicé talleres internos y me animé (junto con mis colaboradores) a pensar en "nativo primero" al resolver problemas.

## Desafíos que Enfrenté

El camino no estuvo exento de obstáculos:

*Soporte de Navegadores*: Aunque excelente para la mayoría de las nuevas características, todavía debo soportar algunas versiones antiguas de navegadores. Esto requirió escribir estrategias de retroceso utilizando herramientas como @supports para garantizar una experiencia funcional y consistente para todos los usuarios.

*Adopción*: Me llevó tiempo desaprender viejos hábitos y confiar en la plataforma nativa sobre frameworks familiares. La programación en pareja y celebrar pequeños logros fueron clave para construir impulso.

*Integración*: Mi sistema de diseño existente y las canalizaciones de CI/CD necesitaban ser actualizadas para acomodar y probar estas nuevas características nativas adecuadamente.

## Los Resultados: Un Éxito Rotundo

El esfuerzo valió la pena en todos los aspectos:

Rendimiento: Vi mejoras notables en mis Core Web Vitals, con tiempos de carga más rápidos y una experiencia de ejecución mucho más fluida.

Accesibilidad: Logré una mejor conformidad con WCAG con menos esfuerzo, ya que el navegador ahora maneja muchas de las interacciones complejas por mí.

Experiencia del Desarrollador: El código es más limpio, más pequeño y más fácil de entender. Esto ha acelerado drásticamente mis ciclos de desarrollo y ha hecho que la incorporación de nuevos miembros del equipo sea mucho más sencilla.

## Reflexiones Finales

Migrar a CSS y HTML modernos ha sido una de las iniciativas más impactantes que he emprendido. La plataforma web es más poderosa y capaz que nunca. Al adoptar estos cambios, no solo he entregado un mejor producto a mis usuarios, sino que también me he empoderado (junto con mis colaboradores) para construir de manera más eficiente.

Si estás atrapado en un código legado, te animo a comenzar a explorar. Comienza con un componente pequeño y de bajo riesgo. El viaje vale la pena.

> ¿Has migrado a nuevas características de CSS o HTML? Comparte tus experiencias y mayores