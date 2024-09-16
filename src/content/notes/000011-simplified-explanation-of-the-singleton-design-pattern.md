---
draft: false
selfHealing: "000005"
title: "Simplified Explanation of the Singleton Design Pattern"
resume: "The primary purpose of this pattern is to restrict the instantiation of a class to a single instance. Although its use cases can be rare, Jorge highlights some practical applications."
image: { src: "singleton_hbupze", alt: "Recicle Singleton image" }
publishDate: "2023-11-14 11:39"
category: "development"
author: "jorge-saud"
tags: [design-patterns, development]
---

in this blog post, I will try to explain the pattern in a simplified way the Singleton Design Pattern, its main purpose is to reconstruct the instantiation of a class to a singular instance, I need to clarify that the use case is very difficult to find but if you think about it in a deeper way I found some interesting uses.

The more known use case is to use a class to define the configuration of an application, to make use of this pattern in this use case we need to define a Class with the definitions and a configuration that can instantiate the class only if this instance does not exist like this

```js
class AppConfig {
  constructor() {
    this.apiEndpoint = "https://api.example.com";
    // Other configuration options
  }
}

const AppConfiguration = (() => {
  let instance;

  function createInstance() {
    return new AppConfig();
  }

  return {
    getInstance: () => {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },
  };
})();

const config = AppConfiguration.getInstance();
```

This use case can be some const defined in a simplified way centralizing them or defining them in the env vars of the deployment process that is because is typically known as an antipattern and not a real pattern.

There are 2 ways very handful to use it, one is to use this pattern to govern the state of an application in a simplified way like a JS vanilla application there is an example of this use case

```js
class GlobalState {
  constructor() {
    this.data = {};
  }

  setData(key, value) {
    this.data[key] = value;
  }

  getData(key) {
    return this.data[key];
  }
}

const AppState = (() => {
  let instance;

  function createInstance() {
    return new GlobalState();
  }

  return {
    getInstance: () => {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },
  };
})();

// Usage
const appState = AppState.getInstance();
// Set Data
appState.setData("user", { id: 1, name: "John Doe" });
// Get Data
```

With this use case, we can resolve a simple state management centralized

The other common use case is to use as a Bus or a PubSub system to communicate 2 elements of different scopes

```js
class EventBus {
  constructor() {
    this.listeners = {};
  }

  subscribe(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  publish(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  }
}

const EventManager = (() => {
  let instance;

  function createInstance() {
    return new EventBus();
  }

  return {
    getInstance: () => {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },
  };
})();

// Usage
const eventBus = EventManager.getInstance();
eventBus.subscribe("userLoggedIn", (user) => {
});
```

> There are some simple examples of this implementation of the more complex to-understand design pattern the Singleton Pattern.
