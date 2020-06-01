self.addEventListener('install', event => {
  console.log('SW installing...');
  // Add a call to skipWaiting here.
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('SW activating...');
});
