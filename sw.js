
const version = 2
let imageName = `imageCache-${version}`
const staticCacheName = `my-app-v${version}`
const asserts = [
  '/',
  'index.html',
  'css/style.css',
  'js/app.js',
  'icons/icon-144x144.png',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png',
  'manifest.json'
]
let dynamicName = `dynamicCache`
let consoleLog = []




function putLog(consoleStr) {
  console.log(consoleStr)
  consoleLog.unshift(` ${consoleStr} `)
}




self.addEventListener('install', (ev) => {
  console.log(`Version ${version} installed`)
  ev.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      cache.addAll(asserts)
    }))


})

self.addEventListener('activate', (ev) => {
  //service worker is activated
  console.log('activated')
  ev.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => {
            if (key != staticCacheName && key != imageName) {
              return true;
            }
          })
          .map((key) => caches.delete(key))
      ).then((empties) => {
        //empties is an Array of boolean values.
        //one for each cache deleted
      });
    })
  );
})

self.addEventListener('fetch', (ev) => {

  //putLog('fetch request for: ' + e.request.url)
  if (ev.request.url.endsWith('test.html')) {
    const blob = {
      status: 200,
      header: 'Content-type: text/html'
    }

    const data = new Response(JSON.stringify(consoleLog), blob)
    consoleLog = []
    ev.respondWith(data)
  } else {
    ev.respondWith(
      caches.match(ev.request).then((cacheRes) => {
        if (cacheRes == undefined) {
          putLog(`${ev.request.url} from server`)
        } else {
          putLog(`${cacheRes.url} from caches`)
        }
        return cacheRes ||
          fetch(ev.request)
            .then((fetchResponse) => {
              let type = fetchResponse.headers.get('content-type')
              if ((type && type.match(/^text\/css/i)) ||
                ev.request.url.match(/cdn.jsdelivr.net/i)) {

                putLog(`save CSS and Bootstrap module in dynamic cahes`)
                return caches.open(dynamicName).then((cache) => {
                  cache.put(ev.request, fetchResponse.clone())
                  return fetchResponse
                })
              }
              else if (type && type.match(/^image\//i)) {

                putLog(`save an IMAGE file ${ev.request.url}`);
                return caches.open(dynamicName).then((cache) => {
                  cache.put(ev.request, fetchResponse.clone())
                  return fetchResponse
                })
              } else {
                putLog(`OTHER save ${ev.request.url}`);
                return caches.open(dynamicName).then((cache) => {
                  cache.put(ev.request, fetchResponse.clone())
                  return fetchResponse
                })
              }
            })

      }))
  }
})

self.addEventListener('message', (ev) => {
  //message from webpage
})