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

      return fetch(request.url);

      // TODO: add fetched files to cache.
    })
    .catch(err => {
      // TODO: respond with custom offline page.
    })
  );
});
