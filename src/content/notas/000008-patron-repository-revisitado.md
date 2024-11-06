---
draft: false
selfHealing: "000008"
title: "El Patrón Repository es una arquitectura de capa de datos o datalayer pattern V1.0"
resume: "El patrón Repositorio en el desarrollo de frontend es incluido en la arquitectura de capa de datos porque se refiere a repositorios y fuentes de datos abstractas del capa de UI y la capa de dominio, solo tomando la transmisión de datos como parte del alcance de sus interacciones."
image: {
    src: "datalayer",
    alt: "Datalayer pattern"
}
publishDate: "2024-06-21 09:45"
category: "Architecture"
author: "000001-jorge-saud"
tags: [microfrontend,development, frontend, backend]
---

Este post es creado porque @Kevcastle hablaba conmigo sobre la estructura compleja de la publicación anterior relacionada con el patrón de repositorio y trato de resolverlo de una manera simple en más de un post, este es el primer de la serie de Datalayer.

Ahora que estamos alineados con el mundo podemos hablar de una manera más ligera sobre el patrón de capa de datos.

Este patrón nos permite encapsular las conexiones de API de manera especial que separa la experiencia del usuario de las llamadas de red, permitiendo que podamos hacer código simple en nuestro UI y solo mapear y reformatear los datos de la red en un mundo separado.

Como hacemos para separar los mundos, comencemos desde dentro hacia afuera, desde el codigo UI a el API, y en cada lugar donde hagamos una llamada a una API para un servicio, en lugar de llamar directamente a `axios`, `fetch` o al cliente del SDK, debemos llamar a una función que resuelva los datos que nuestra interfaz de usuario necesita y aislar la solicitud en un archivo que gestione todas las conversiones, conexiones, autorizaciones, y todos los problemas de conectividad y mapeo en un solo lugar llamado la **Capa de Datos** (DataLayer). Esta DataLayer puede ser bastante grande en algunos casos, por lo que utilizamos un patrón compuesto para separar las responsabilidades y el patrón de repositorio para encapsular la solicitud basado en un **Diseño Orientado a Dominios** (Domain Driven Design), o en palabras más simples, en estructuras más cercanas a la lógica de negocio, donde tenemos una responsabilidad y todas las conexiones que resuelven esa responsabilidad viven en la misma capa. Dadas estas observaciones, podemos hacer una llamada como esta:
```ts
// UX widget 
interface MyUIData{
  email:string;
  name: string;
}
function myWidget(){
  const MyDataLayer=DataLayers.get('myData');
  const [isLoading,setIsLoading]=useState(true);
  const [data,setData]= useState<MyUIData>({
    name:'',
    email:''
  })
  
  useEffect(
    const fetchData=async()=>{
      try{
      const dataLayer=await MyDataLayer.getInformation()
      setData(dataLayer);
      }finally{
        setLoading(false)
      }
    }
    fetchData();
    ,[])
  if(isLoading){
    return <LoadingComponent>
  }
  return <MyLoadedComponent data={data}>
}
```

Mira este ejemplo en el que podemos darnos cuenta de que estamos esperando que la información se represente en nuestro sitio e incluso usamos useQuery para permitir el almacenamiento en caché de estos datos, pero no nos preocupa cómo se obtienen los datos ni cómo provienen del servicio porque en la capa de datos de myData tenemos toda esta lógica y podemos hacer que se devuelva en este método la misma estructura que la interfaz MyUIData, esto hace que la solicitud de API o la capa de datos se resuelvan como necesitamos en la interfaz y cuando falla incluso puede arrojar para mostrar el error relacionado con la integración.

Esta es la forma más simple de implementación, pero dentro de la capa podemos usar una diversidad de clientes para resolver cada método de nuestra capa de datos, devolviendo cada vez el elemento UI requerido para nuestra capa de vista.

E incluso podemos separar los clientes para realizar toda la configuración básica o interceptores en el caso de Axios para permitir que la llamada sea lo más limpia posible.

Esta publicación es breve pero concisa. Si desea una implementación interna de este patrón, puede ver el código en la [publicación del patrón del repositorio](/notebook/repository-pattern) donde hay una implementación más específica o ejemplos de implementación.
