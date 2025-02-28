const CACHE_STATIC_NAME = 'static-1.0.6';
const CACHE_DYNAMIC_NAME = 'dynamic-1.0.6';

const STATIC_FILES = ['/', '/offline'];
const TRIM_EXP_IN_DYN = ['https://www.giorgiosaud.io'];

const NO_DYNAMIC_PATH = [
  'chrome-extension',
  'extension',
  'manifest.json',
  'gstatic.com',
  'NRJS-',
  'res.cloudinary.com',
  'www.googletagmanager.com',
  'g.dev',
  'www.google-analytics.com',
];

const CACHES_USED_NAMES = [
  "giorgio-runtime-v2",
  CACHE_STATIC_NAME,
  CACHE_DYNAMIC_NAME,
];

const trimCache = async (maxItems) => {
  try {
    const cache = await caches.open(CACHE_DYNAMIC_NAME);
    const keys = await cache.keys();
    const keysExpiries = keys.filter(key =>
      TRIM_EXP_IN_DYN.some(exp => key.url.includes(exp))
    );
    if (keysExpiries.length > maxItems) {
      await cache.delete(keysExpiries[0]);
      return trimCache(maxItems);
    }
  } catch (error) {
    console.error('Error trimming cache:', error);
  }
};

const activatingServiceWorker = async (event) => {
  const keyList = await caches.keys();
  return Promise.all(
    keyList.map(key => {
      if (!CACHES_USED_NAMES.includes(key)) {
        return caches.delete(key);
      }
    })
  );
};

const installingServiceWorker = async () => {
  const cache = await caches.open(CACHE_STATIC_NAME);
  return cache.addAll(STATIC_FILES);
};

const isInStaticFiles = (url) => {
  const path = url.replace(location.origin, '');
  return STATIC_FILES.includes(path);
};

const respondWithStaticCacheIfExist = async (event) => {
  try {
    const response = await fetch(event.request);
    const cache = await caches.open(CACHE_STATIC_NAME);
    cache.put(event.request.url, response.clone());
    return response;
  } catch (error) {
    const cache = await caches.open(CACHE_STATIC_NAME);
    return cache.match(event.request.url);
  }
};

const manageResponseInFetch = async (event) => {
  if (isInStaticFiles(event.request.url)) {
    return respondWithStaticCacheIfExist(event);
  } else if (event.request.headers.get('accept').includes('text/html')) {
    try {
      const response = await fetch(event.request);
      if (!NO_DYNAMIC_PATH.some(path => event.request.url.includes(path))) {
        await trimCache(5);
        const cache = await caches.open(CACHE_DYNAMIC_NAME);
        cache.put(event.request.url, response.clone());
      }
      return response;
    } catch (error) {
      try {
        const dynamicCache = await caches.open(CACHE_DYNAMIC_NAME);
        const dynamicCacheResponse = await dynamicCache.match(event.request.url);
        if (!dynamicCacheResponse) {
          throw new Error('Dynamic Cache unavailable');
        }
        return dynamicCacheResponse;
      } catch (error) {
        const cache = await caches.open(CACHE_STATIC_NAME);
        return cache.match('/offline');
      }
    }
  } else {
    try {
      const response = await fetch(event.request);
      await trimCache(5);
      const dynamicCache = await caches.open(CACHE_DYNAMIC_NAME);
      dynamicCache.put(event.request.url, response.clone());
      return response;
    } catch (error) {
      const dynamicCache = await caches.open(CACHE_DYNAMIC_NAME);
      return dynamicCache.match(event.request.url);
    }
  }
};

self.addEventListener('install', (event) => {
  event.waitUntil(installingServiceWorker());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(activatingServiceWorker());
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  
  // Skip cross-origin requests, like those for Google Analytics.
  if (event.request.url.startsWith(self.location.origin)&& self.location.origin==='https://www.giorgiosaud.io') {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        if(event.request.method === 'POST'){
          return event.response;       
        }
        return caches.open(CACHE_DYNAMIC_NAME).then(cache => {
          return fetch(event.request).then(response => {
            // Put a copy of the response in the runtime cache.
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            }).catch(err=>console.log(err));
          });
        });
      })
    );
  }
});
