const id = "repository-pattern-revisited.md";
						const collection = "notes";
						const slug = "repository-pattern-revisited";
						const body = "\nThis post is created because @Kevcastle talk to me about the complex structure of the previous post related to Repository pattern and I try to resolve it in a simples way in more than one post, this is the first of Datalayer series.\n\nNow that we are aligned with the world we can talk in a more light way about Datalayer Pattern.\n\nThis pattern allow us to encapsulate the concerns of API connections in a special way that, separates the User Experience from the network calls, allowing us to make simple code in our ui and only map and reformat the data from the network in a separated world.\n\nHow does it make to separate the worlds, lets start from inside out, from UI code to the api, in every place where we make an api call to a service, we must instead of call the axios, fetch or SDK client call a function thar resolves it to the data that our UI needs and sandbox the request in a file that make every conversion, connection, authorization, and all conectivity and mapping issue in one place called the DataLayer, this dataLayer can be pretty big in some cases, for this reason is that we use a composite pattern to separate the concerns and  the repository pattern to encapsulate the request based on a Domain Driven Design level, or in simple words in a more business logic structures where we have a concern and all the connections that resolves that concern lives in the same Layer, given this observations we can make a call like this\n```ts\n// UX widget \ninterface MyUIData{\n  email:string;\n  name: string;\n}\nfunction myWidget(){\n  const MyDataLayer=DataLayers.get('myData');\n  const [isLoading,setIsLoading]=useState(true);\n  const [data,setData]= useState<MyUIData>({\n    name:'',\n    email:''\n  })\n  \n  useEffect(\n    const fetchData=async()=>{\n      try{\n      const dataLayer=await MyDataLayer.getInformation()\n      setData(dataLayer);\n      }finally{\n        setLoading(false)\n      }\n    }\n    fetchData();\n    ,[])\n  if(isLoading){\n    return <LoadingComponent>\n  }\n  return <MyLoadedComponent data={data}>\n}\n```\n\nLook this example on it we can figure out that we are awaiting for information to render in our site and even use useQuery to allow caching of this data, but we are not concerned in how the data is fetched and niether how the data cames from the service because in the datalayer of myData we have all this logic and we can enforce to return in this method the same structire as MyUIData interface, this enforces the api request or datalayer to resolve as we need in the interface and when it fails it can even throw to show the error related to the integration.\n\nThis is the most simplistic way of implementation but inside of the layer we can use a diversity of clients to resolve every method of our dataLayer, evrytime returning the required UI element for our view layer.\n\nAnd even we can separate the clients to make all the basic setup or interceptors in the Axios case to allow the call be as cleanest as possible.\n\nthis post is ahort but consice if you want some inner implementation of this pattern you can see the code in the [repository pattern post](/notebook/repository-pattern) where is a more specific implementation or examples of implementation";
						const data = {draft:false,title:"The Repository pattern is called Data Layer Architecture",resume:"The Repository Pattern in frontend development is included in the Data Layer architecture because it concerns about Repositories and datasources abstracted from the UI layer and the Domain Layer, only taking the data transmission as part of the scope of its interactions.",selfHealing:"000009",image:{src:"datalayer",alt:"Datalayer pattern"},publishDate:new Date(1718977500000),author:{slug:"jorge-saud",collection:"team"},category:"Architecture",tags:["microfrontend","development","frontend","backend"]};
						const _internal = {
							type: 'content',
							filePath: "/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/repository-pattern-revisited.md",
							rawData: undefined,
						};

export { _internal, body, collection, data, id, slug };
