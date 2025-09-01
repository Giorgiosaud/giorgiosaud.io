---
draft: false
title: Entendiendo peticiones Preflight y CORS
selfHealing: "000007"
description: Explora cómo CORS y las solicitudes preflight optimizan la seguridad y el acceso a recursos en aplicaciones web modernas.
publishDate: 2024-05-30T21:46:00.000Z
category: integration
collections:
  - frontend
  - integration
author: 000001-jorge-saud
tags:
  - frontend
  - csp
  - integrations
  - cors
  - preflightrequest
  - preflight
  - common-issues
cover: ../../../assets/images/preflight-request-12.webp
coverAlt: Entendiendo peticiones Preflight y CORS
slug: peticiones-preflight
---

Cuando hablamos de aplicaciones del lado del cliente, ventajas de los microservicios y micro-frontend, integraciones desde el lado del cliente y cómo hacer que nuestras aplicaciones sean más independientes, estamos hablando de estos problemas comunes, describámoslos brevemente.

CORS (intercambio de recursos entre orígenes): por razones de seguridad de comunicación, los navegadores restringen las solicitudes entre dominios, pero ¿qué es una solicitud entre dominios? Imagine una web servida desde una URL

`https://my.web.com`

Esa solicitud de recursos vía XMLHttpRequest desde otro de esta manera se puede realizar mediante los métodos GET, POST, PUT o PATCH.

`https://other.web.net/some-resource.json`

Esta es una solicitud entre dominios porque son dominios separados y podrían ser propiedad de diferentes desarrolladores u organizaciones y, debido a eso, el navegador debe garantizar que podamos acceder a estos recursos de forma segura.

Aquí es donde CORS entra en acción, cada recurso que se debe obtener a través de Fetch API o XMLHttpRequest debe venir con encabezados adicionales, el encabezado principal que nos permite consumir recursos es Access-Control-Allow-Origin, este encabezado se puede configurar para permitir que cualquier origen consuma nuestros recursos de esta manera:

`Access-Control-Allow-Origin: *`

o sólo restringirlo a algún sitio como este:

`Access-Control-Allow-Origin: https://my.web.com`

Con eso restringimos el acceso a nuestros recursos consumidos directamente desde el navegador pero hacer que suceda en todas las solicitudes a veces es costoso, imagina que tienes que subir por correo una imagen grande y después de enviar toda esta gran solicitud te das cuenta de que tu URL no tiene permitido consumir este servicio, y allí es donde Preflight Requests vino a ayudar, están íntimamente relacionados con cors porque cuando necesitamos acceder a un recurso externo como este desde nuestro sitio web, el navegador envía una solicitud con el método OPTIONS al servidor antes de que se envíe la principal para verificar si esta solicitud se puede realizar, normalmente verifica si el método de solicitud es aceptado y si el encabezado de origen está presente en este recurso, con esta información y antes de enviar cualquier payload al navegador puede verificar el estado de salud y la capacidad del servicio para ejecutar la solicitud.

Este tipo de solicitud se llama Solicitud Preflight y se llama automáticamente directamente desde el navegador, no por el código del frontend sino que el propio navegador realiza la solicitud para optimizar los recursos del cliente (evitando la costosa llamada a una API si no tiene acceso de seguridad o está inactiva).

Para finalizar aquí les dejo un gráfico que representa la forma en que se dice cuando se llama a la solicitud de preflight desde Wikipedia!![Preflight schema](../../../assets/images/preflight-request-12.webp)


Aquí hay una prueba previa del cartero para validar si la respuesta lo requiere y si la respuesta de la solicitud OPTIONS es correcta

<script src="https://gist.github.com/Giorgiosaud/b01d2da46090f35ebbac533f1f0959b8.js"></script>
