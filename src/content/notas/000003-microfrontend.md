---
draft: false
selfHealing: "000003"

title: "Micro Frontend Architecture"
resume: "Giorgio discusses the benefits and implementation of micro frontend architecture, emphasizing its growing popularity and effectiveness in modern web development. He outlines how this architecture enables more efficient, specialized development by dividing frontend applications into smaller, manageable components."
image: { src: "microfrontend_klswbm", alt: "Micro Frontend Architecture" }
publishDate: "2023-05-08 11:39"
category: "architecture"
author: 000001-jorge-saud
tags: [microfrontend, architecture]
---

En un [artículo anterior](https://es.modyo.com/blog/los-micro-frontends-permiten-a-tus-desarrolladores-crear-mejores-productos-digitales), hablamos de cómo los micro frontends ofrecen más libertad a los equipos y aplicaciones más eficientes. Por ello, se están haciendo populares entre los arquitectos y desarrolladores porque grandes organizaciones y líderes de la industria están gestionando con éxito sus propias aplicaciones web utilizando arquitecturas de micro frontends. 


Podemos empezar explicando primero cómo determinar si algo es una tendencia que solo está de moda, una nueva forma de hacer las cosas que la gente está empezando a adoptar, o una arquitectura ampliamente aceptada. Empecemos por definir la palabra, arquitectura:


Es tanto el proceso como el producto de la planificación, el diseño y la construcción de edificios u otras estructuras. Las obras arquitectónicas, en forma de edificios, se perciben a menudo como símbolos culturales y como obras de arte. Las civilizaciones históricas suelen identificarse con los logros arquitectónicos que han sobrevivido en el tiempo.


Como dice la definición, la arquitectura es representativa de una época o período de tiempo; esto también es cierto para la arquitectura de software. Todo lo relacionado con la arquitectura, ya sea física o de software, es algo que debe evolucionar y representar una forma de hacer las cosas a largo plazo.

## Arquitectura de Micro Frontends

La arquitectura frontend es un concepto nuevo, pero cada día es más popular debido a la evolución de la web y a la necesidad de que las personas interactúen más con los computadores, los sitios web, las aplicaciones nativas y las (aplicaciones web progresivas)[https://www.youtube.com/watch?v=zB9xQH_Rhnk&t=4s]. La forma en que utilizamos y elegimos la tecnología, como la arquitectura frontend, es más importante ahora que nunca, dados los cambios que ha traído la pandemia del COVID-19. No sólo utilizamos la tecnología para hacernos la vida más fácil y cómoda, sino también para estar más seguros. Nos ayuda a mantenernos seguros en casa, a pagar servicios en línea y a mantener la rueda económica en general. 


Aunque hemos hecho muchos cambios para adaptarnos a las exigencias de la pandemia, estos cambios no son temporales. Están aquí para quedarse, lo que ahora impulsa la necesidad del mercado de adoptar una nueva arquitectura: una arquitectura que interactúe directamente con las personas, que humanice nuestras interacciones con ellas y no se limite a las API. Esta situación nos obliga a evolucionar en la forma de prestar nuevos servicios y a aprovechar un tiempo de time to market (TTM). Tenemos que tomar las decisiones que tomamos en el front end con mucha consideración y más responsabilidad. Aquí es donde la arquitectura del frontend emerge de las sombras.


Y sí, digo "de las sombras" porque esta arquitectura siempre ha existido. Cuando definimos una aplicación como un Modelo Vista Controlador (MVC), o una Aplicación de Página Única (SPA) que consume una API, es responsabilidad de los arquitectos de software tomar decisiones sobre la arquitectura que resuelve un caso de uso determinado, y los arquitectos deben tener en cuenta una serie de factores:


La forma en que se atienden las colas.

Los servicios que necesitan ser orquestados para tener una API efectiva disponible.

La capa Backend For Frontend (BFF) para ayudar a crear una fácil implementación y separación de roles para diferentes frameworks.

Muchos otros factores que exigen consideración y empujan la definición del front-end a una escala de importancia mucho menor..


Para resolver estos temas, aquí es donde surge el Arquitecto de Frontend, porque este debe ocuparse de la experiencia del usuario, el rendimiento, el SEO, la accesibilidad, los eventos de etiquetado, y asumir la propiedad de esta capa, entre el servicio y el usuario.

![Micro frontends](https://cdn.modyo.cloud/uploads/537d8e9f-8a76-46d4-986b-29874c856028/original/micro_fontend_1-opti.png)

## Cómo los arquitectos aprovechan las ventajas los micro frontends

Como hemos mencionado antes, la importancia de los MVC está creciendo y necesitamos nuevas formas de trabajar para satisfacer la demanda. Sin embargo, los MVCs y SPAs están sumidos en problemas que reducen la velocidad general debido a la ampliación de los procesos de pipeline, resolviendo dificultades y problemas durante los despliegues rápidos. Esto desalinea las prioridades de los desarrolladores para centrarse más en el negocio que en el código necesario para implementarlo, lo que significa menos tiempo resolviendo problemas en StackOverflow 😉.


En este escenario, los micro frontends (MFEs) ofrecen un camino a seguir para que el desarrollo de frontend sea más especializado, aprovechando el Domain-Driven-Design (DDD) para orientar las aplicaciones frontend hacia los respectivos subdominios de negocio y desplegar lo más rápido posible de principio a fin.


Incluso dentro del desarrollo MFE, hay una variedad de enfoques. Uno de ellos consiste en separar una aplicación personalizada en mini aplicaciones, a veces nano aplicaciones, que se encargan de aspectos específicos como el carrito de compra o el resumen de compra. Este enfoque podría incluir la separación de una cesta de la compra de una página de vista general del producto. Otro enfoque podría abordar cuestiones de optimización, por ejemplo, separando una imagen dentro de una tarjeta de los detalles de la misma. Normalmente, en Modyo, utilizamos un enfoque más global asociado al subdominio y a los objetivos del negocio.

## Micro Frontends en Modyo

Entre un enfoque de aplicación completa de una sola página, y un enfoque de micro aplicación basada puramente en la funcionalidad, en Modyo utilizamos algo intermedio, donde separamos las aplicaciones por su subdominio de negocio. Llamamos a cada una de estas aplicaciones un widget, y estos widgets pueden ser gestionados independientemente del resto de la aplicación web desarrollada. Incluso pueden desplegarse y retroceder por sí solos, y aprovechar las ventajas de la plataforma Modyo en general para arrancar y gestionarlos, inyectándolos en una página para que se carguen de forma asíncrona en el orden que necesitemos.


En Modyo fomentamos el uso de MFEs, pero más específicamente, aquellos que se renderizan del lado del cliente, en lugar de, digamos, del lado del servidor, como las soluciones single-spa o la federación de módulos webpack. Esto nos categoriza en un espacio específico dentro de la arquitectura MFE, y aunque ya [estamos entregando activamente productos digitales al mercado con este enfoque](https://es.modyo.com/soluciones/microfrontend), seguimos haciendo mejoras con el tiempo para alinear más estrechamente nuestras soluciones con un enfoque de arquitectura MFE.


Recientemente, hemos resuelto cómo compartir porciones de código entre aplicaciones, de forma similar a como los diseñadores trabajan con [los sistemas de diseño](https://es.modyo.com/blog/disenando-productos-consistentes-y-escalables). Esta preocupación de compartir código dentro de una arquitectura MFE pura es tabú, pero hacemos que funcione poniendo todo ese código común en un paquete disponible para cualquier MFE como dependencia, haciendo posible desarrollarlo y actualizarlo (con su propio ritmo de desarrollo y con un versionado semántico adecuado) independientemente de la aplicación principal. Se trata de tomar decisiones deliberadas en la organización sobre cuáles son los componentes comunes y compartidos. Con este enfoque, logramos nuestro objetivo de TTM lo más rápido posible, manteniendo el rigor en la definición de cada aplicación desplegada de forma independiente, aprovechando el código compartido que tenemos disponible para la gestión de  nuestra arquitectura MFE.


Al entregar el contenido, Modyo es una mezcla entre un CMS descabezado (headless) y desacoplado, que además cuenta con las ventajas que entrega un CMS desacoplado a nivel estratégico. Podemos entregar el contenido desde el lado del servidor directamente a nuestros widgets (MFEs) a través del Motor de Plantillas Liquid que soportamos de forma nativa. Es una buena práctica adoptar y aprovechar esta arquitectura MFE, con la base de la composición MFE del lado del cliente.
![Join pieces](https://cdn.modyo.cloud/uploads/66fa7d1d-29a5-42f6-ac16-26d4f3f25cbb/original/407688742.png)

## El futuro de los Micro Frontends en Modyo

Estamos trabajando duro en nuevas características que nos permitan ofrecer esta arquitectura a través de la plataforma Modyo, todo ello sin interrumpir el flujo de trabajo normal de los desarrolladores expertos en el mercado, entregándoles también  la capacidad de utilizar las APIs nativas para construir interacciones entre los widgets sin quebrar los principios básicos de MFE.

En un próximo post, hablaremos de cómo hacer que esto suceda desde una perspectiva de frontend y de cómo esto mejora nuestro trabajo una vez que la manera de gestionar la arquitectura MFE de Modyo está en nuestras venas.

¡Hasta la próxima!.
