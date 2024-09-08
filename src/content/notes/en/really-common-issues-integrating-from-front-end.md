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
author: "es/jorge-saud"
tags: [frontend,csp,integrations,common,issues]
---

Hi welcome to another mini-post, this is about CSP let's start defining CSP content security policy this is a security layer based on mitigation of XSS attacks and data injection.

To activate CSP you must make a setup in your server configuration to add this header `Content-Security-Policy` in some older versions, this header was `X-Content-Security-Policy` `X-WebKit-CSP`

or alternatively, you can set a meta tag defining it as this but not recommended:

```html
<meta http-equiv="Content-Security-Policy" content="">
```

## What can we delimit with a CSP?

We can set policies based on this directives:

* **default-src:** This directive sets a default source list for all other directives  
* **script-src:** This directive restricts which scripts the protected resource can execute. The \* directive also controls other resources, such as XSLT style sheets \[XSLT\], which can cause the user agent to execute script
* **style-src:** This directive restricts which styles the user applies to the protected resource.
* **img-src:** This directive restricts from which URIs the protected resource can load images.
* **font-src:** This directive restricts from which URIs the protected resource can load fonts. This applies when processing the [@font](https://hashnode.com/@font)\-face CSS rule
* **connect-src:** This directive restricts which URIs the protected resource can load using script interfaces. This applies to the open() method of an XMLHttpRequest Object, the WebSocket constructor and the EventSource constructor.
* **media-src:** This directive restricts from which URIs the protected resource can load video and audio. This applies to data for a video or audio clip, such as when processing the src attribute of a video, audio, source, or track elements.
* **object-src:** This directive restricts from which URIs the protected resource can load plugins. This applies to the data attribute of an object element, the src attribute of embed elements, or the code or archive attributes of an applet element. Data for any object, embed, or applet element must match the allowed object sources in order to be fetched.
* **frame-src:** This directive restricts from where the protected resource can embed frames.
* **report-uri:** This URI Must use the same port and protocol as the protected resource and must receive a post request

### The values that we can set for these directives are basically these ones

* **none**: Deny all access
* **\***: Wildcard all access
* **Self**: URI must have the same scheme, host, and port as the protected resource’s URI
* **Data**: Embedded data, such as a base64 encoded image
* **Host**: this is the last element where we can set URIs acceptable to inject content and

> for example, if we want to set a default policy to accept resources from self URL and base64 and only from [mysite.com](https://mysite.com) data we can set the policy like this:

```
Content-Security-Policy: "default-src 'self' data: https://mysite.com"
```

> In case of the directives script-src and style-src, we have additional values to set like this ones:

* **inline**: Inline html entities, such as

```html
<script>alert(‘Hi ;)’)</script>
```

or in case of styles

```html
<style>
h1{
    color:red;
}
</style>
```

and in the case of script, we can limit the eval execution:

with the Eval Directive

>Lets complement the last example of the policy allowing the css and js inline and allow eval in js the result is:

```
Content-Security-Policy: "default-src 'self' data: https://giorgiosaud.com; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'"
```

we can set special directives for any of them overlapping the **default-src** ones or set only the desired directives that we need, and that's all.

Hoping that you know a little more about **CSP** see you later in another post and here is another interesting post about CORS and Preflight Request.