---
draft: true
selfHealing: "000013"
title: "The microfrontend Architecture is not Decoupled is Resilient"
resume: "The coupling between the microfrontend and the backend is strictly protected by a contract. However, if this contract is broken, it could potentially disrupt the entire application. The issue is not the coupling itself, but the need for resilience in this kind of development. It's crucial to implement methods that can handle any changes in the backend effectively. And more important clear communication"
image: { src: "singleton_hbupze", alt: "Recicle Singleton image" }
publishDate: "2023-11-14 11:39"
category: "architecture"
author: 000001-jorge-saud
tags: [microfrontend, architecture, alignment]
---

When we talk of coupled or decoupled architecture the microfrontend is one of the top architectural patterns that can be used to accomplish goals, and in many times the decoupling architecture is related with this kind of implementation and manytimes its compared coupling with monolithics and decoupled with microfrontend architectures but, is that really true?.

In my opinion with many years working with microfrontnd architecture I think that it enables work in paralells teams but is not totally decoupled because the code separation of concerns only lead the conversation to accomplish contracts between deployment and development, when we decouple an application the comunication between bridges is the most important thing to take in consideration because if we dont take this in consideration is a pretty vulnerable way of work.
