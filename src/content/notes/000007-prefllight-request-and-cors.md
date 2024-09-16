---
draft: false
title: "Preflight request and Cors"
selfHealing: "000007"
resume: "When we talk about client-side applications, advantages of microservices and micro-frontend, integrations from the client-side, and make our apps more independent we are talking about these common issues"
image:
  { src: "preflight-request-12", alt: "Preflight request and Cors Updated" }
publishDate: "2024-05-30 17:46"
category: "integration"
author: "jorge-saud"
tags:
  [
    frontend,
    csp,
    integrations,
    cors,
    preflightrequest,
    preflight,
    common-issues,
  ]
---

When we talk about client-side applications, advantages of microservices and micro-frontend, integrations from the client-side, and make our apps more independent we are talking about these common issues lets describe them briefly.

CORS(cross-origin resource sharing) for security communicational reasons browsers restrict cross-domain requests, but what is a cross-domain request? imagine a web served from an URL

`https://my.web.com`

That ask resources via XMLHttpRequest from another like this can be made via GET, POST, PUT, or PATCH methods.

`https://other.web.net/some-resource.json`

This is a cross-domain request because those are separated domains this could be owned by different developers/organizations and because of that, the browser need to ensure that we can access these resources securely.

Here is where CORS came in help every resource that must be fetched via the Fetch API or XMLHttpRequest must come with extra headers the main header that allows us to consume resources is Access-Control-Allow-Origin this header can be set to allow any origin to consume our resources like this:

`Access-Control-Allow-Origin: *`

or only restrict it to some site like this:

`Access-Control-Allow-Origin: https://my.web.com`

With that, we restrict access to our resources consumed directly from the browser but make it happen in all request is sometimes expensive, imagine that you have to upload via post some big image and after you send all this big request you get noticed that your URL is not allowed to consume this service, and there is where Preflight Requests came to help they are intimately related with cors because when we need access to an external resource like this from our website, the browser sends a request with the method OPTIONS to the server before the main one is sent to verify if this request can be done, normally it verifies if the request method is accepted and if the origin header is present in this resource, with this information and before sending any payload to the browser can check the health status and the capability of the service to execute the request.

This kind of request is called Preflight Request and is automatically called directly from the browser, not by the front end code but the browser itself makes the request to optimize the client resources (avoiding the expensive call of an API if it doesn't have security access or is down).

To finalize here is a graphic representing the way that said when the prefight request is called from Wikipedia
![Preflight schema](https://res.cloudinary.com/giorgiosaud/image/upload/f_auto/q_auto/ar_1.0,c_auto,g_auto/v1/notebook-posts/preflight-request-12?_a=DATAdtIIZAA0)

Here is a postman preflight test to validate if the response requires it and if the response of the OPTIONS request is ok

<script src="https://gist.github.com/Giorgiosaud/b01d2da46090f35ebbac533f1f0959b8.js"></script>
