const staticCacheName = 'restaurantreviews-v2';

self.addEventListener('install', function(event) {
  // console.log("Service Worker installed");
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
           "./",
           "./index.html",
           "./restaurant.html",
           "./css/styles.css",
           "./js/idb.js",
           "./js/dbhelper.js",
           "./js/main.js",
           "./manifest.json",
           "./favicon.ico",
           "./js/restaurant_info.js",
           "./images/1-1600_large.jpg",
           "./images/1-400_small.jpg",
           "./images/1-800_medium.jpg",
           "./images/10-1600_large.jpg",
           "./images/10-400_small.jpg",
           "./images/10-800_medium.jpg",
           "./images/2-1600_large.jpg",
           "./images/2-400_small.jpg",
           "./images/2-800_medium.jpg",
           "./images/3-1600_large.jpg",
           "./images/3-400_small.jpg",
           "./images/3-800_medium.jpg",
           "./images/4-1600_large.jpg",
           "./images/4-400_small.jpg",
           "./images/4-800_medium.jpg",
           "./images/5-1600_large.jpg",
           "./images/5-400_small.jpg",
           "./images/5-800_medium.jpg",
           "./images/6-1600_large.jpg",
           "./images/6-400_small.jpg",
           "./images/6-800_medium.jpg",
           "./images/7-1600_large.jpg",
           "./images/7-400_small.jpg",
           "./images/7-800_medium.jpg",
           "./images/8-1600_large.jpg",
           "./images/8-400_small.jpg",
           "./images/8-800_medium.jpg",
           "./images/9-1600_large.jpg",
           "./images/9-400_small.jpg",
           "./images/9-800_medium.jpg",
           "./images/mws-rr-192.png",
           "./images/mws-rr-512.png",
           "./restaurant.html?id=1",
           "./restaurant.html?id=2",
           "./restaurant.html?id=3",
           "./restaurant.html?id=4",
           "./restaurant.html?id=5",
           "./restaurant.html?id=6",
           "./restaurant.html?id=7",
           "./restaurant.html?id=8",
           "./restaurant.html?id=9",
           "./restaurant.html?id=10",
           'http://localhost:1337/restaurants/',
           'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
           'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css'
      ]);
    })
  );
   //console.log("cache successful");
});

// deletes old cache
self.addEventListener('activate', function(event) {
  // console.log("Service Worker activated");
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('restaurantreviews-') &&
                 cacheName != staticCacheName;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
      // console.log("Old cache removed");
    })
  );
});

self.addEventListener('fetch', function(event) {
  // console.log("Service Worker starting fetch");
  event.respondWith(
    caches.open(staticCacheName).then(function(cache) {
      return cache.match(event.request).then(function (response) {
        if (response) {
          // console.log("data fetched from cache");
          return response;
        }
        else {
          return fetch(event.request).then(function(networkResponse) {
            // console.log("data fetched from network", event.request.url);
            // cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch(function(error) {
            console.log("Unable to fetch data from network", event.request.url, error);
          });
        }
      });
    }).catch(function(error) {
      console.log("Something went wrong with Service Worker fetch intercept", error);
    })
  );
});