---
draft: false
selfHealing: "000005"
title: Mastering the Repository Pattern in Frontend Development
description: Descubre cómo implementar el Patrón de Repositorio en frontend para mejorar la gestión de datos y la mantenibilidad de tus aplicaciones.
image:
  src: repository pattern
  alt: Repository Pattern
publishDate: 2024-05-21 09:45
category: Architecture
author: 000001-jorge-saud
collections:
  - architecture
  - patterns
tags:
  - microfrontend
  - development
  - frontend
  - backend
fmContentType: Notas
cover: ../../../assets/images/datalayer.webp
coverAlt: Data transparent
---

En el mundo del desarrollo frontend, gestionar los datos de manera eficiente es crucial para construir aplicaciones escalables y mantenibles. Un patrón arquitectónico que ha demostrado ser altamente efectivo para lograr este objetivo es el **Patrón de Repositorio**. Tradicionalmente utilizado en el desarrollo backend, el Patrón de Repositorio se está adoptando cada vez más en el desarrollo frontend por su capacidad para desacoplar la lógica de acceso a datos de la lógica de negocio.

Esto ha ido creciendo con técnicas como la arquitectura de micro-frontend, donde necesitamos desacoplar e aislar términos, pero también mantener algunos elementos compartidos entre proyectos para asegurar la consistencia. Aquí es donde la gestión de datos puede volverse un caos y se necesitan tomar decisiones arquitectónicas para lograr esta consistencia y evitar retrabajos.

## El Patrón de Repositorio es importante por varias razones, que denomino STAR-D:

- **Separación de responsabilidades (Definición de Clientes y Separación de Ámbitos):** El patrón ayuda a definir límites claros entre diferentes partes de la aplicación. Separa la lógica de acceso a datos (clientes, repositorios) de la lógica de negocio y las llamadas a API, asegurando que cada parte del código tenga una única responsabilidad y sea más fácil de gestionar.

- **Testabilidad:** Esto significa que los métodos de los repositorios pueden ser fácilmente simulados, lo que facilita la escritura de pruebas unitarias para tu micro-frontend. Esto lleva a un código más confiable y mantenible, y también nos permite simular las acciones más simples de las solicitudes y probar los escenarios de fallos de las solicitudes.

- **Manejo de datos abstraído (Desacoplando la Lógica del Componente del Consumo y Entrega de Datos):** El Patrón de Repositorio permite que la definición del componente y su lógica estén desacopladas de cómo se consumen y entregan los datos. Esto significa que los componentes pueden centrarse puramente en el renderizado y la interacción del usuario, mientras que los repositorios manejan la recuperación y el procesamiento de datos. Esta separación de responsabilidades lleva a un código más limpio y mantenible.

- **Reutilización:** Al separar el cliente de la solicitud y el método del repositorio de la interfaz, y declarar los métodos que deben ser utilizados por el componente, estás creando una segregación que nos permite utilizar el mismo cliente para muchos repositorios. No siempre, pero muchas veces cuando trabajamos con SSO, el método de autorización en las APIs es el mismo, por lo que no necesitas escribir este inicio de sesión en cada llamada. Solo escribes el cliente correctamente y haces la solicitud en el repositorio, lo que también nos permite hacer la solicitud más abstracta, y si por alguna razón el cliente o la solicitud cambian, el componente obtiene los mismos datos y funciona tan bien como antes. Incluso si el mapeo cambia, el repositorio se encarga de ello para evitar cambios en el componente.

- **Claridad de Definición (Seguridad de Tipos con TypeScript):** TypeScript nos permite hacer un código más predecible, y no esperar hasta levantar un entorno de desarrollo local o usar registros en consola para detectar errores tipográficos. Con TypeScript, podemos definir la interfaz de nuestro componente y la interfaz de las respuestas de nuestras APIs para facilitar el mapeo de las solicitudes.

Al incorporar el Patrón de Repositorio, los desarrolladores frontend pueden crear aplicaciones que no solo sean más fáciles de probar y mantener, sino también más flexibles y adaptables a los cambios.

## Ejemplo

En este ejemplo, exploraré cómo implementar el Patrón de Repositorio en una aplicación React utilizando TypeScript. Crearé una estructura de carpetas que incluya repositorios para obtener datos de una API y una fuente de datos simulada. Esta configuración nos permite cambiar entre fuentes de datos reales y simuladas sin problemas, demostrando la flexibilidad y la facilidad de prueba que proporciona el Patrón de Repositorio.

### Estructura de Carpetas

En esta estructura de carpetas, puedes crear un patrón de repositorio que sea independiente del framework, haciéndolo adecuado para su uso en cualquier framework.

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

### Implementación

Ahora definiré cada archivo en esta estructura de carpetas, comenzando con el más simple: las definiciones de interfaz. Aquí, definiremos y acordaremos el contrato de API o SDK entre nuestro componente y el recurso solicitado.

```ts
// src/interfaces/apis/summary/Get.d.ts
import { GetPaths } from "./GetPaths";

export interface ISummaryAccountsResponse {
  amount: number;
}
export interface ISummaryCardsResponse {
  amount: number;
}
type GetSummaryAccounts = (
  string: TPaths.SUMMARY_ACCOUNT,
) => Promise<ISummaryAccountsResponse>;
type GetSummaryCards = (
  string: TPaths.SUMMARY_CARD,
) => Promise<ISummaryCardsResponse>;
export type GetData = GetSummaryAccounts & GetSummaryCards;
export enum TPaths {
  SUMMARY_ACCOUNT = "summary",
  SUMMARY_CARD = "summary/card",
}
```

Y los endpoints en GetPaths:

```ts
// src/interfaces/apis/summary/GetPaths.ts
export enum GetPaths {
  KEY = "key",
  PULIC_KEY = "pubkey",
}
```

Las transacciones deberían ser similares:

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
  TRANSACTIONS = "transactions",
}
```

Todos los elementos definidos en estas interfaces son los que nuestro componente ya hecho requiere para funcionar correctamente.

Luego vamos a trabajar en el cliente e intentamos implementarlo de dos maneras: una con axios y otra con fetch.

```ts
// src/repositories/clients/apiClient.ts

import axios from "axios";

const BASE_URL = "https://api.example.com";
const TOKEN = "MY_JWT_TOKEN";
const ApiClient = axios.create(BASE_URL);
const addTokenInterceptor = (config) => {
  const newConfig = { ...config };
  return newConfig.commons.headers({
    Authorization: `Bearer ${TOKEN}`,
  });
};

ApiClient.interceptors.request.use(addTokenInterceptor);

export default ApiClient;
```

O usar fetch de esta manera:

```ts
// IapiClient.d.ts
import { GetData as TGetData } from "./apis/transactions/Get";
import { GetData as SGetData } from "./apis/summary/Post";

type GetData = TGetData & SGetData;

export interface IApiClient {
  getData: GetData;
  postData: PostData;
}
```

Esto nos permitirá usar cualquier método de solicitud en nuestro archivo de repositorio.

El archivo del repositorio:

```ts
// src/repositories/summaryRepository.ts
// if you have request definitions import here like this
/*import {
  type ITransactionRequest,
} from './interfaces/apis/transactions/Get.ts';
*/
import ApiClient from "./clients/apiClient.ts";

const summaryRepository = {
  //and use the payload as param typed from ITransactionRequest
  async getSummary(): ISummary {
    const summary = await Apiclient.getData("summary")<ISummary>;
    /**
     * We can get the data, parse it to
     * comply with ISummary, and then return it.
     * */
    return summary;
  },
};

export default summaryRepository;
```

Ahora podemos crear tantos repositorios como queramos.

Luego utilizaremos la fábrica de repositorios para permitir usar un solo método de fábrica para obtener el repositorio.

```ts
// src/repositories/RepositoryFactory.ts

import SummaryRepository, { ISummaryRepository } from "./summaryRepository.ts";
import OtherRepository, { IOtherRepository } from "./OtherRepository.ts";

type Repositories = "summary" | "other";
function get(string: "summary"): ISummaryRepository;
function get(string: "other"): IOtherRepository;
function get(string: Repositories): unknown;

function get(name: Repositories) {
  switch (name) {
    case "summary":
      return SummaryRepository;
    case "other":
      return OtherRepository;
    default:
      return null;
  }
}

export default {
  get,
};
```

Esto nos permite hacer pruebas más fáciles que simular axios con moxios o cosas similares, porque podemos usar un espía en el repositorio y simular el valor resuelto para él cuando ejecutamos la prueba.

```ts
import SummaryRepository from '@/repository/summaryRepository.ts';

jest.spyOn(SummaryRepository,'getSummary').mockResolvedValue({
  amount: 100;
  currency: "$";
  accountNumber: "123-123-123";
});
```

Tan simple como esto, podemos simular el método getSummary y obtener datos de ejemplo para nuestra prueba o hacer que falle.

Tenga en cuenta que podría haber errores en este código, ya que no se ejecutó; solo está destinado a ilustrar cómo implementar el repositorio de fábrica. Si encuentra algún problema, informe de ello a mi correo electrónico. "Una vez que encuentro la mejor solución, la publicaré con el nombre de la persona que mejor se ajusta y fue la primera para proporcionarlo ;) ....
