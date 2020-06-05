const filesToCache = [
  '/',
  'style/main.css',
  'images/still_life_medium.jpg',
  'index.html',
  'pages/offline.html',
  'pages/404.html'
];

const staticCacheName = 'pages-cache-v1';

self.addEventListener('install', event => {
  console.log('SW attempting install.');

  event.waitUntil(
    caches.open(staticCacheName)
    .then(cache => cache.addAll(filesToCache))
  );
});

self.addEventListener('fetch', event => {
  console.log('SW attempting fetch', event.request.url);

  event.respondWith(
    caches.match(event.request)
    .then(response => {
      if (response) {
        console.log('cache hit:', event.request.url);

        return response;
      }
      console.log('cache miss:', event.request.url);

      return fetch(event.request.url).then(response => {
        // TODO: Respond with custom 404 page.
        if (response.status === 404) {
          console.log('serving 404 page.');

          return caches.match('pages/404.html')
          .then(response => response);
        }
        return caches.open(staticCacheName).then(cache => {
          cache.put(event.request.url, response.clone());

          return response;
        });
      });
    })
    .catch(err => {
      // TODO: respond with custom offline page.
    })
  );
});
