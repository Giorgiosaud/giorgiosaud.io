---
draft: false
title: "Repository pattern in frontend"
snippet: "The Repository Pattern in frontend development abstracts data access logic, enhancing code maintainability and testability by encapsulating operations and promoting loose coupling. It fosters modular, scalable codebases adaptable to changing requirements."
image: {
    src: "https://cdn.giorgiosaud.io/repository%20pattern.webp?&fit=crop&w=430&h=240",
    alt: "Repository Pattern"
}
publishDate: "2024-05-21 09:45"
category: "Architecture"
author: "Giorgio Saud"
tags: [micro-frontend,development, frontend, backend]
---

In the world of frontend development, managing data efficiently is crucial for building scalable and maintainable applications. One architectural pattern that has proven to be highly effective in achieving this goal is the Repository Pattern. Traditionally used in backend development, the Repository Pattern is increasingly being adopted in frontend development for its ability to decouple data access logic from business logic.

This has been growing with techniques like micro-frontend architecture where we need to decouple and isolate terms but also keep some elements shareables between projects to keep consistency here is where the data management can become a mess, and we need to take some architectural decisions to accomplish this consistency, and avoid rework.

## The Repository Pattern is important for several reasons, that i call <abbr class="text-slate-600">STRAD</abbr>

- **Separation of concerns (Definition of Clients and Separation of Scopes):** The pattern helps define clear boundaries between different parts of the application. It separates the data access logic (clients, repositories) from the business logic, and Api calls, ensuring that each part of the code has a single responsibility and is easier to manage.

- **Testability:** This means that repositories methods can be easily mocked, making it simpler to write unit tests for your micro-frontend. Leading to more reliable and maintainable code, and also allow us to make mock of simplest request actions and test the failed request scenarios.

- **Reusablity:** When we separate the client of the request and the repository method from the interface and declare the methods that shoud be used from the component, you are making a segregation that allows us to use the same client for many repositories because not always but many times when we work with SSO the authorization method in apis is the same, then you dont need to write this login in every call you only write the client well and make the request in the repository, wich allow us also to make the request more abstract and if for come reason the client or request changes the component get the same data and work as well as before, even if the mapping changes the repository take charge of it to avoid changes in the component.

- **Abstracted data hadling (Decoupling Component Logic from Data Consumption and Delivery):** The Repository Pattern allows the definition of the component and its logic to be decoupled from how data is consumed and delivered. This means that components can focus purely on rendering and user interaction, while repositories handle data retrieval and processing. This separation of concerns leads to cleaner and more maintainable code.

- **Definition Clarity (Type Safety with TypeScript):** Typescript allow us to make more predictable code, and not wait until raise a local dev environment or use console logs to get typos errors, with Ts we can define the interface of our component and the interface of our apis responses to make easy the mapping of the request.

By incorporating the Repository Pattern, frontend developers can create applications that are not only easier to test and maintain but also more flexible and adaptable to changes.

## Example

In this example, i will explore how to implement the Repository Pattern in a React application using TypeScript. I will create a folder structure that includes repositories for fetching data from an API and a mock data source. This setup allows us to switch bet
en real and mock data sources seamlessly, demonstrating the flexibility and ease of testing that the Repository Pattern provides.

### Folder Structure

In this folder structure, you can create a repository pattern that is framework-agnostic, making it suitable for use in any framework.

```zsh
src/
  ├── repositories/
  │   ├── clients/
  │   │   └── apiClient.ts
  │   ├── summaryRepository.ts
  │   ├── transactionsRepository.ts
  │   └── repositoryFactory.ts
  ├── interfaces/
  │   └── ISummary.ts
  │   └── ITransactions.ts
  └── components/
      └── DataComponent.tsx
```

### Implementation

Now, I will define each file in this folder structure, starting with the simplest one: the interface definitions. Here, we will define and agree upon the API or SDK contract between our component and the requested resource.

```ts
// src/interfaces/ISummary.ts

export interface ISummary {
  amount: number;
  currency: string;
  accountNumber: string;
}
```

```ts
// src/interfaces/ISummary.ts
interface ITransaction{
    date: Date;
    description: string;
    amount: number;
    isCleared: boolean;
}
export interface ITransactions {
  transactions[]: ITransaction[];
}
```
All the elements defined in these interfaces are the ones that our already-made component requires to work properly.

Then lets go for more, lets work in the client and try to implement it in 2 ways an axios one and a fetch one

```ts
// src/repositories/clients/apiClient.ts

const BASE_URL='https://api.example.com';
const TOKEN='MY_JWT_TOKEN';
const ApiClient ={
  async getData(path)<T>: Promise<T> {
    const response = await fetch(`https://api.example.com/${path}`,{
        headers:{
            'content-type':'application/json',
            Authorization:`Bearer ${TOKEN}`,
        }
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data: T = await response.json();
    return data;
  },
  /** 
   *  Here is an example of posting data 
   * for which you should define an interface,
   *  but for practical purposes, we will define it as unknown.
   */
  async postData(path,data:unknown): Promise<T> {
    const response = await fetch(`https://api.example.com/${path}`,{
        method:'POST',
        body:JSON.stringify(data),
        headers:{
            'content-type':'application/json',
            Authorization:`Bearer ${TOKEN}`,
        }
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data: T = await response.json();
    return data;
  }
}

export default ApiClient;
```

I can also use axios and simplify this client like this

```ts
// src/repositories/clients/apiClient.ts

import axios from 'axios';

const BASE_URL='https://api.example.com';
const TOKEN='MY_JWT_TOKEN';
const ApiClient= axios.create(BASE_URL);
const addTokenInterceptor=(config)=>{
    const newConfig={...config};
    return newConfig.commons.headers({
            Authorization:`Bearer ${TOKEN}`,
    });
}

ApiClient.interceptors.request.use(addTokenInterceptor);

export default ApiClient;
```

This will allow us to use any method request in our repository file, and we can use these clients to fetch data in those repository files.

The repository file:

```ts
// src/repositories/summaryRepository.ts

import { ISummary } from '../../interfaces/ISummary';
import ApiClient from './clients/apiClient.ts';

const summaryRepository={
    async getSummary():ISummary{
        const summary = await Apiclient.getData('summary')<ISummary>
        /**
         * We can get the data, parse it to 
         * comply with ISummary, and then return it.
         * */
        return summary;
    }
}

export default summaryRepository
```

Now we can create as many repositories as we want.

Then we will use the repository factory to allow use one single factory method to get the repository

```ts
// src/repositories/RepositoryFactory.ts

import SummaryRepository from './summaryRepository.ts';
import OtherRepository from './OtherRepository.ts';

type GETREPOSITORY=get("summary"):typeof SummaryRepository;
type GETREPOSITORY=get("other"):typeof OtherRepository;
export default {
    get(repo){
        repositories= {
            "summary":SummaryRepository,
            "other":OtherRepository
        }
        return repositories[repo]
    }
}
```

This allow us to make test more easy than mocking axios with moxios or thigs like this because we can use a spy on the repository and mock the resolved value for it when we run the test 

```ts
import SummaryRepository from '@/repository/summaryRepository.ts';

jest.spyOn(SummaryRepository,'getSummary').mockResolvedValue({
  amount: 100;
  currency: "$";
  accountNumber: "123-123-123";
});
```

As simple as this we can mock the method getSummary and get example data for our test or make it fail.

Please note that there might be errors in this code as it was not run; it is only meant to illustrate how to use the repository factory. If you find any issues, please report them to my email. "Once I find the best solution, I will post it with the name of the person who fits best and was first to provide it ;) ....