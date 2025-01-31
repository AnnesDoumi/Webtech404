self.addEventListener("install", (event) => {
    console.log("[Service Worker] Installing new version...");

    event.waitUntil(
        caches.open("app-cache").then((cache) => {
            return cache.addAll([
                "/",
                "/index.html",
                "/manifest.json",
                "/offline.html",
                "/favicon.ico",
                "/icons/icon-144x144.png",
                "/icons/icon-192x192.png",
                "/icons/icon-512x512.png"
            ]);
        })
    );

    self.skipWaiting(); // Sofort aktivieren, ohne auf alte Instanzen zu warten
});

self.addEventListener("activate", (event) => {
    console.log("[Service Worker] Activating new version...");

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== "app-cache") // Nur alte Caches löschen
                    .map((cacheName) => caches.delete(cacheName))
            );
        }).then(() => {
            return self.clients.claim(); // Alle Clients auf die neue Version umstellen
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                return caches.match(event.request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        } else if (event.request.mode === "navigate") {
                            return caches.match("/offline.html");
                        }
                    });
            })
    );
});

// Sicherstellen, dass alte Service Worker entfernt werden
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});
