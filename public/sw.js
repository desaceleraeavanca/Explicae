// Basic service worker to enable installability
self.addEventListener("install", (event) => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  clients.claim()
})

// Minimal fetch handler; required for install criteria
self.addEventListener("fetch", () => {
  // no-op
})