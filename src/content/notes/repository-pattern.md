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

In the ever-evolving landscape of frontend development, managing data efficiently is crucial for building scalable and maintainable applications. One architectural pattern that has proven to be highly effective in achieving this goal is the Repository Pattern. Traditionally used in backend development, the Repository Pattern is increasingly being adopted in frontend development for its ability to decouple data access logic from business logic.

## The Repository Pattern is important for several reasons, summarized by the acronym <abbr class="text-slate-600">STRAD</abbr>

- **Separation of concerns (Definition of Clients and Separation of Scopes):** The pattern helps define clear boundaries bet
en different parts of the application. It separates the data access logic (clients) from the business logic, ensuring that each part of the code has a single responsibility and is easier to manage.

- **Testability:** Repositories can be easily mocked, making it simpler to write unit tests for your application. This allows developers to test components in isolation, leading to more reliable and maintainable code.

- **Reusablity (Abstraction of API Consumption):** By abstracting the details of how data is fetched from APIs or SDKs, the Repository Pattern allows developers to change the data source without impacting the rest of the application. This means you can switch from one API to another or even use mock data for testing purposes without altering your core business logic.

- **Abstracted data hadling (Decoupling Component Logic from Data Consumption and Delivery):** The Repository Pattern allows the definition of the component and its logic to be decoupled from how data is consumed and delivered. This means that components can focus purely on rendering and user interaction, while repositories handle data retrieval and processing. This separation of concerns leads to cleaner and more maintainable code.

- **Definition Clarity (Type Safety with TypeScript):** When using TypeScript, implementing interfaces or types for external repositories adds an extra layer of type safety. This ensures that your code adheres to specific contracts, reducing the likelihood of runtime errors and improving the overall robustness of your application.

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

Please note that there might be errors in this code as it was not run; it is only meant to illustrate how to use the repository factory. If you find any issues, please report them to my email. "Once I find the best solution, I will post it with the name of the person who fits best and was first to provide it ;) ....