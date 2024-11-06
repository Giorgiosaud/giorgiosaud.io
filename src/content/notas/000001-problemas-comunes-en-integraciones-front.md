---
draft: false
title: "Content Security Policy (CSP)"
selfHealing: "000001"
resume: "Content Security Policy (CSP), a security layer that mitigates XSS attacks and data injection. To activate CSP, one must set up the server configuration to include the Content-Security-Policy header. Alternatively, a meta tag can be used, although it's not recommended."
image: {
    src: "Really common issues integrating frontend",
    alt: "Really common issues integrating from front-end image"
}
publishDate: "2021-05-12 11:39"
category: "integration"
author: "000001-jorge-saud"
tags: [frontend,csp,integrations,common,issues]
---

Hola, bienvenido a otra mini publicación. Se trata de CSP. Comencemos definiendo la política de seguridad de contenido de CSP. Esta es una capa de seguridad basada en la mitigación de ataques XSS e inyección de datos.

Para activar CSP debes realizar una configuración en tu servidor para agregar este encabezado `Content-Security-Policy` en algunas versiones anteriores este encabezado era `X-Content-Security-Policy` `X-WebKit-CSP`

o alternativamente, puedes establecer una metaetiqueta que lo defina así, pero no se recomienda:

```html
<meta http-equiv="Content-Security-Policy" content="">
```
## ¿Qué podemos delimitar con una CSP?

Podemos establecer políticas basadas en estas directivas:

* **default-src:** Esta directiva establece una lista de fuentes predeterminada para todas las demás directivas.  
* **script-src:** Esta directiva restringe qué scripts puede ejecutar el recurso protegido. La directiva \* también controla otros recursos, como hojas de estilo XSLT \[XSLT\], que pueden hacer que el agente de usuario ejecute scripts.
* **style-src:** Esta directiva restringe qué estilos puede aplicar el usuario al recurso protegido.
* **img-src:** Esta directiva restringe desde qué URIs el recurso protegido puede cargar imágenes.
* **font-src:** Esta directiva restringe desde qué URIs el recurso protegido puede cargar fuentes. Esto se aplica al procesar la regla CSS [@font](https://hashnode.com/@font)\-face.
* **connect-src:** Esta directiva restringe desde qué URIs el recurso protegido puede cargar utilizando interfaces de script. Esto se aplica al método open() de un objeto XMLHttpRequest, al constructor WebSocket y al constructor EventSource.
* **media-src:** Esta directiva restringe desde qué URIs el recurso protegido puede cargar video y audio. Esto se aplica a los datos de un clip de video o audio, como al procesar el atributo src de los elementos video, audio, source o track.
* **object-src:** Esta directiva restringe desde qué URIs el recurso protegido puede cargar plugins. Esto se aplica al atributo data de un elemento object, al atributo src de los elementos embed o a los atributos code o archive de un elemento applet. Los datos de cualquier elemento object, embed o applet deben coincidir con las fuentes de objetos permitidas para ser cargados.
* **frame-src:** Esta directiva restringe desde dónde el recurso protegido puede incrustar marcos (frames).
* **report-uri:** Este URI debe usar el mismo puerto y protocolo que el recurso protegido y debe recibir una solicitud POST.

### Los valores que podemos establecer para estas directivas son básicamente los siguientes:

* **none**: Niega todo acceso.
* **\***: Permite acceso a todo.
* **Self**: El URI debe tener el mismo esquema, host y puerto que el URI del recurso protegido.
* **Data**: Datos incrustados, como una imagen codificada en base64.
* **Host**: Este es el último elemento donde podemos establecer URIs aceptables para inyectar contenido.

> Por ejemplo, si queremos establecer una política predeterminada para aceptar recursos desde la URL propia y datos base64 solo desde [mysite.com](https://mysite.com), podemos configurar la política de esta manera:

```bash
Content-Security-Policy: "default-src 'self' data: https://mysite.com"
```

> En el caso de las directivas script-src y style-src, tenemos valores adicionales para configurar como los siguientes:

* **inline**: Entidades HTML en línea, como:

```html
<script>alert(‘Hola ;)' )</script>
```

o en el caso de estilos:


```html
<style>
h1 {
    color: red;
}
</style>
```
Y en el caso de los scripts, podemos limitar la ejecución de eval:

Con la directiva Eval.

>Complementemos el último ejemplo de la política permitiendo CSS y JS en línea, y permitiendo eval en JS. El resultado es:

```
Content-Security-Policy: "default-src 'self' data: https://giorgiosaud.com; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'"
```
Podemos establecer directivas especiales para cualquiera de ellas, superponiendo las de default-src o configurar solo las directivas deseadas que necesitemos, y eso es todo.

Esperando que ahora sepas un poco más sobre CSP, nos vemos en otro post, y aquí tienes otro post interesante sobre CORS y solicitudes Preflight.

>¡Espero que te sea útil! Avísame si necesitas más ayuda.