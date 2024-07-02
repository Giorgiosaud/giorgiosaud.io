---
draft: false
selfHealing: "000005"
title: "Repository pattern in frontend"
resume: "The Repository Pattern in frontend development abstracts data access logic, enhancing code maintainability and testability by encapsulating operations and promoting loose coupling. It fosters modular, scalable codebases adaptable to changing requirements."
image: {
    src: "repository pattern",
    alt: "Repository Pattern"
}
publishDate: "2024-05-21 09:45"
category: "Architecture"
author: "jorge-saud"
tags: [micro-frontend,development, frontend, backend]
---

In the world of frontend development, managing data efficiently is crucial for building scalable and maintainable applications. One architectural pattern that has proven to be highly effective in achieving this goal is the Repository Pattern. Traditionally used in backend development, the Repository Pattern is increasingly being adopted in frontend development for its ability to decouple data access logic from business logic.

This has been growing with techniques like micro-frontend architecture where we need to decouple and isolate terms but also keep some elements shareables between projects to keep consistency here is where the data management can become a mess, and we need to take some architectural decisions to accomplish this consistency, and avoid rework.

## The Repository Pattern is important for several reasons, that I call STAR-D

- **Separation of concerns (Definition of Clients and Separation of Scopes):** The pattern helps define clear boundaries between different parts of the application. It separates the data access logic (clients, repositories) from the business logic, and Api calls, ensuring that each part of the code has a single responsibility and is easier to manage.

- **Testability:** This means that repositories methods can be easily mocked, making it simpler to write unit tests for your micro-frontend. Leading to more reliable and maintainable code, and also allow us to make mock of simplest request actions and test the failed request scenarios.

- **Abstracted data hadling (Decoupling Component Logic from Data Consumption and Delivery):** The Repository Pattern allows the definition of the component and its logic to be decoupled from how data is consumed and delivered. This means that components can focus purely on rendering and user interaction, while repositories handle data retrieval and processing. This separation of concerns leads to cleaner and more maintainable code.

- **Reusablity:** When we separate the client of the request and the repository method from the interface and declare the methods that shoud be used from the component, you are making a segregation that allows us to use the same client for many repositories because not always but many times when we work with SSO the authorization method in apis is the same, then you dont need to write this login in every call you only write the client well and make the request in the repository, wich allow us also to make the request more abstract and if for come reason the client or request changes the component get the same data and work as well as before, even if the mapping changes the repository take charge of it to avoid changes in the component.

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
  │   │   └── ApiClient.ts
  │   ├── SummaryRepository.ts
  │   ├── TransactionsRepository.ts
  │   └── RepositoryFactory.ts
  ├── interfaces/
  │   └── apis
  │       └── summary
  │           └── Get.d.ts
  │           └── GetPaths.ts
  │       └── transactions
  │           └── Get.d.ts
  │           └── GetPaths.ts
  │           └── Post.d.ts
  │   └── IApiClient.ts
  └── components/
      └── DataComponent.tsx
```

### Implementation

Now, I will define each file in this folder structure, starting with the simplest one: the interface definitions. Here, we will define and agree upon the API or SDK contract between our component and the requested resource.

```ts
// src/interfaces/apis/summary/Get.d.ts
import { GetPaths } from './GetPaths';

export interface ISummaryAccountsResponse {
  'amount': number
}
export interface ISummaryCardsResponse {
  'amount': number
}
type GetSummaryAccounts = (string:TPaths.SUMMARY_ACCOUNT)=>Promise<ISummaryAccountsResponse>;
type GetSummaryCards = (string:TPaths.SUMMARY_CARD)=>Promise<ISummaryCardsResponse>;
export type GetData = GetSummaryAccounts & GetSummaryCards;
export enum TPaths {
  SUMMARY_ACCOUNT = 'summary',
  SUMMARY_CARD = 'summary/card',
}



```

And the endpoint paths in GetPaths

```ts
// src/interfaces/apis/summary/GetPaths.ts
export enum GetPaths {
  KEY = 'key',
  PULIC_KEY = 'pubkey',
}

```

Transactions should be the same as before

```ts
// src/interfaces/apis/transactions/Get.ts
import { TPaths } from './GetPaths';

interface ITransaction{
    date: Date;
    description: string;
    amount: number;
    isCleared: boolean;
}
export interface ITransactions {
  transactions[]: ITransaction[];
}

type GetTransactions = (string:TPaths.TRANSACTIONS)=>Promise<ITransactions>;
export type GetData = GetTransactions;
```

```ts
// src/interfaces/apis/transactions/GetPaths.ts
export enum TPaths {
  TRANSACTIONS = 'transactions',
}

```

All the elements defined in these interfaces are the ones that our already-made component requires to work properly.

Then lets go for more, lets work in the client and try to implement it in 2 ways an axios one and a fetch one

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

or use fetch like this

```ts
// IapiClient.d.ts
import { GetData as TGetData } from './apis/transactions/Get';
import { GetData as SGetData} from './apis/summary/Post';

type GetData=TGetData&SGetData;

export interface IApiClient {
  getData: GetData;
  postData: PostData;
}


```

This will allow us to use any method request in our repository file, and we can use these clients to fetch data in those repository files.

The repository file:

```ts
// src/repositories/summaryRepository.ts
// if you have request definitions import here like this
/*import {
  type ITransactionRequest,
} from './interfaces/apis/transactions/Get.ts';
*/
import ApiClient from './clients/apiClient.ts';

const summaryRepository={
  //and use the payload as param typed from ITransactionRequest
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

import SummaryRepository, { ISummaryRepository } from './summaryRepository.ts';
import OtherRepository, { IOtherRepository } from './OtherRepository.ts';

type Repositories = 'summary' | 'other';
function get(string:'summary'):ISummaryRepository;
function get(string:'other'):IOtherRepository;
function get(string:Repositories):unknown;

function get(name: Repositories) {
  switch (name) {
    case 'summary':
      return SummaryRepository;
    case 'other':
      return OtherRepository;
    default:
      return null;
  }
}

export default {
    get
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
