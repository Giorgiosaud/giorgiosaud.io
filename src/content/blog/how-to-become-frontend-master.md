---
draft: true
title: "CORS and Preflight Requests explained"
snippet: "The post offers a comprehensive overview of handling CORS and Preflight Requests to optimize client-side resource integration and security."
image: {
    src: "https://cdn.giorgiosaud.io/CORS%20%2B%20Preflight%20Request%20.webp?&fit=crop&w=430&h=240",
    alt: "CORS and Preflight Requests explained"
}
publishDate: "2022-11-11 11:39"
category: "integration"
author: "Giorgio Saud"
tags: [frontend,cors,preflight-request,integrations]
---
When we talk about client-side applications, advantages of microservices and micro-frontend, integrations from the client-side, and make our apps more independent we are talking about these common issues lets describe them briefly.

CORS(cross-origin resource sharing) for security communicational reasons browsers restrict cross-domain requests, but what is a cross-domain request? imagine a web served from an URL `https://my.web.com` That ask resources via XMLHttpRequest from another like this `https://other.web.net/some-resource.json` can be made via GET, POST, PUT, or PATCH methods.

This is a cross-domain request because those are separated domains this could be owned by different developers/organizations and because of that, the browser need to ensure that we can access these resources securely.

Here is where CORS came in help every resource that must be fetched via the Fetch API or XMLHttpRequest must come with extra headers the main header that allows us to consume resources is Access-Control-Allow-Origin this header can be set to allow any origin to consume our resources like this:

```
Access-Control-Allow-Origin: *
```

Or only restrict it to some site like this:

```
Access-Control-Allow-Origin: https://my.web.com
```

With that, we restrict access to our resources consumed directly from the browser but make it happen in all request is sometimes expensive, imagine that you have to upload via post some big image and after you send all this big request you get noticed that your URL is not allowed to consume this service, and there is where Preflight Requests came to help they are intimately related with cors because when we need access to an external resource like this from our website, the browser sends a request with the method OPTIONS to the server before the main one is sent to verify if this request can be done, normally it verifies if the request method is accepted and if the origin header is present in this resource, with this information and before sending any payload to the browser can check the health status and the capability of the service to execute the request.

This kind of request is called Preflight Request and is automatically called directly from the browser, not by the front end code but the browser itself makes the request to optimize the client resources (avoiding the expensive call of an API if it doesn't have security access or is down).

To finalize here is a graphic representing the way that said when the prefight request is called from Wikipedia

![image.png](https://cdn.giorgiosaud.io/o2FU26DzG.avif)

> Here is a postman preflight test to validate if the response requires it and if the response of the OPTIONS request is ok

```js
function verifyCustomHeaders(optionsResponse,originalHeaders){
    const accessControlAllowHeader=optionsResponse.headers.find(header=>header.key.toLowerCase()==='access-control-allow-headers')
    const originalHeadersArray=originalHeaders.split(', ')

    if(!accessControlAllowHeader){
        console.error('header "Access-Control-Allow-Headers" missing in option request')
    }else{
        const missingInaccessControlAllowHeader=originalHeadersArray.filter(n => !accessControlAllowHeader.value.split(', ').includes(n))
        if(missingInaccessControlAllowHeader.length>0){
            console.error(`missing "${missingInaccessControlAllowHeader.join(', ')}" "Access-Control-Allow-Headers"`)
        }
    }
};
(function () {
    const request = pm.request
    const url = request.url.toString()
    const requestMethod = request.method
    const headers = request.headers.toObject()
    const origin = headers.origin
    if (!origin) {
        throw new TypeError('The request must have an Origin header to attempt a preflight please add it to test the preflight request')
    }
    console.info(`Checking preflight request for ${origin}`)
    delete headers.origin
    const requestHeaders = Object.keys(headers).join(', ')
    if (!['GET', 'HEAD', 'POST'].includes(requestMethod)) {
        console.warn(`The request uses ${requestMethod}, so a preflight will be required`)
    } else if (requestHeaders) {
        console.warn(`The request has custom headers, so a preflight will be required with this custom headers: ${requestHeaders}`)
    } else {
        console.info("A preflight may not be required for this request but we'll attempt it anyway")
    }
    const preflightHeaders = {
        Origin: origin,
        'Access-Control-Request-Method': requestMethod
    }
    if (requestHeaders) {
        preflightHeaders['Access-Control-Request-Headers'] = requestHeaders
    }
    pm.sendRequest({
        url,
        method: 'OPTIONS',
        header: preflightHeaders
    }, (err, optionsResponse) => {
        if (err) {
            throw new Error('Error:', err)
        }
        console.info(`Preflight response has status code ${optionsResponse.code}`)
        console.log(optionsResponse)
        if(requestHeaders){
            verifyCustomHeaders(optionsResponse,requestHeaders)
        }
        console.info(`verifiying other headers:`)
        const optionalCustomHeaders = [
            'access-control-allow-origin',
            'access-control-allow-methods',
            'access-control-allow-credentials',
            'access-control-max-age'
        ]

        const headersArray=optionsResponse.headers.map(header => header.key.toLowerCase())
        const missingCustomHeadersArray=optionalCustomHeaders.filter(n => !headersArray.includes(n))
        if(missingCustomHeadersArray.length>0){
            console.error(`Cors Failure headers posibbly missing "${missingCustomHeadersArray.join(', ')}"`);
        }
    })
})()
```
