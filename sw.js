const CACHE_NAME = 'walrun-v6';
const ASSETS = [
    './',
    './index.html',
    './assets/css/output.css',
    './src/js/app.js',
    './manifest.json',
    './assets/walkrunicon.jpg',
    './assets/faaah.mp3',
    'https://unpkg.com/alpinejs@3.14.3/dist/cdn.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
