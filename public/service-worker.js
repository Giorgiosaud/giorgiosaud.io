const CACHE_STATIC_NAME = 'static-1.0.0';
const CACHE_DYNAMIC_NAME = 'dynamic-1.0.0';

const STATIC_FILES = [
  '/',
  '/offline',
];
const TRIM_EXP_IN_DYN=['https://www.giorgiosaud.io'];

const NO_DYNAMIC_PATH=[
  'NRJS-'
];

const CACHES_USED_NAMES=["giorgio-runtime-v1",CACHE_STATIC_NAME,CACHE_DYNAMIC_NAME]
const trimCache=async (maxItems) =>{
  try{
    const cache=await caches.open(CACHE_DYNAMIC_NAME)
    const keys=await cache.keys()
    const keysExpiries=keys.filter(key=>{
      return TRIM_EXP_IN_DYN.some(exp=>key.url.includes(exp))
    });
    if (keysExpiries.length > maxItems) {
      console.log('[Service Worker] CACHE KEYS REMOVED',keysExpiries[0])

      cache.delete(keysExpiries[0])
      return trimCache(maxItems);
    }
  }catch(error){
    throw error;
  }
}
const activatingServiceWorker=async(event)=>{
  const keyList = await caches.keys()
  console.log('[Service Worker] activatingServiceWorker:::CACHES_REGISTERED:::',keyList)
  return Promise.all(keyList.map( (key) =>{
    if(!CACHES_USED_NAMES.includes(key)){
      console.log('[Service Worker] Removing old cache.', key);
      return caches.delete(key);
    }
  }))
}

const installingServiceWorker=async()=>{
  const cache=await caches.open(CACHE_STATIC_NAME)
  console.log('[Service Worker] Precaching App Shell');
  return cache.addAll(STATIC_FILES);
}
const IsInStaticFiles=(url)=>{
  console.log(STATIC_FILES)
  const path=url.replace(location.origin,'')
  return STATIC_FILES.includes(path)
}

const respondWithStaticCacheIfExist=async (event)=>{
  try{
    const response=await fetch(event.request)
    const cache=await caches.open(CACHE_STATIC_NAME)
    cache.put(event.request.url, response.clone());
    return response;
  }catch(error){
    const cache=await caches.open(CACHE_STATIC_NAME)
    const offlineResponse=await cache.match(event.request.url);
    return offlineResponse
  }
}

const manageResponseInFetch=async(event)=>{
  if(IsInStaticFiles(event.request.url)){
    console.log('[Service Worker] manageResponseInFetch');
    return respondWithStaticCacheIfExist(event)
  }else if(event.request.headers.get('accept').includes('text/html')){
    try{
      const response=await fetch(event.request)
      if(!NO_DYNAMIC_PATH.some(path=>event.request.url.includes(path))){
        trimCache(5)
        const cache=await caches.open(CACHE_DYNAMIC_NAME)
        cache.put(event.request.url, response.clone());
      }
      return response;
    }catch(error){
      try{
        const dynamicCache=await caches.open(CACHE_DYNAMIC_NAME)
        const dynamicCacheResponse=await dynamicCache.match(event.request.url);
        if(!dynamicCacheResponse){
          throw new TypeError('Dynamic Cache unavailable')
        }
        return dynamicCacheResponse
      }catch(error){
        const cache=await caches.open(CACHE_STATIC_NAME)
        const offlineResponse=await cache.match('/offline');
        return offlineResponse
      }
    }
  }else{
    try{
      const response=await fetch(event.request)
      
      if(!NO_DYNAMIC_PATH.some(path=>event.request.url.includes(path))){
        trimCache(5)
        const dynamicCache=await caches.open(CACHE_DYNAMIC_NAME)
        dynamicCache.put(event.request.url, response.clone());
      }
      // trimCache(CACHE_DYNAMIC_NAME, 15);
      return response;
    }catch(error){
      const dynamicCache=await caches.open(CACHE_DYNAMIC_NAME)
      const dynamicCacheResponse=await dynamicCache.match(event.request.url);
      return dynamicCacheResponse
    }
  }
}


self.addEventListener('install', (event) =>{
  console.log('[Service Worker] Installing Service Worker 34...', event);
   event.waitUntil(installingServiceWorker());
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil(activatingServiceWorker());
  return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  console.log('[Service Worker] fetch....', event);
  event.respondWith(manageResponseInFetch(event))
});