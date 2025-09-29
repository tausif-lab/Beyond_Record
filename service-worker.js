const CACHE_NAME = "pwa-cache-v1";
const urlsToCache = [
    "/",
    "/dashboard/student",
    "/dashboard/faculty",
    "/dashboard/faculty/nacc-report",
];
importScripts("https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js");

self.addEventListener("install", event => {
    console.log("SW: Installing...");
    event.waitUntil(
        caches.open("wire-game-cache-v1").then(cache => {
            console.log("SW: Caching files:", urlsToCache);
            return cache.addAll(urlsToCache);
        })
    );
});

// Fetch events
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }

                // Clone the request because it's a stream
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then((response) => {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response because it's a stream
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }).catch(() => {
                    // If both cache and network fail, return offline page
                    if (event.request.destination === 'document') {
                        return caches.match('/index.html');
                    }
                });
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background sync for when user comes back online
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('Background sync triggered');
        // You can add logic here to sync game data when back online
    }
});

// Push notification support (optional)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New game update available!',
        icon: 'icon-192.png',
        badge: 'icon-72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '2'
        },
        actions: [
            {
                action: 'explore',
                title: 'Play Game',
                icon: 'icon-192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: 'icon-192.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Wire Connection Game', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Background Sync for Cloud Data
self.addEventListener("sync", event => {
    if (event.tag === "sync-progress") {
        event.waitUntil(uploadLocalProgress());
    }
});

async function uploadLocalProgress() {
    const progress = await localforage.getItem("game-progress");
    if (progress) {
        try {
            await fetch("/api/save-progress", {
                method: "POST",
                body: JSON.stringify(progress),
                headers: { "Content-Type": "application/json" }
            });
            await localforage.removeItem("game-progress");
            console.log("✅ Synced progress to server");
        } catch (err) {
            console.error("❌ Sync failed, will retry:", err);
        }
    }
}

function saveExamProgress() {
    const progress = {
        level: selectedLevel,
        answers: userAnswers,
        score: score,
        timestamp: new Date().toISOString()
    };
    saveProgress(progress);
}



