importScripts('./media-cache-list.js');

const CACHE_NAME = 'amino-v18-block2-cba';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './final-data.js',
  './final-data.js?v=20261031-block2-cba',
  './exercise-library.js',
  './exercise-library-expanded.js',
  './media-manifest.js',
  './media-manifest-expanded.js',
  './media-cache-list.js',
  './data/workout-program-final.json',
  './data/workout-program-legacy-2026-07.json',
  './data/workout-program-block1-2026-10-17.json',
  './data/block2-exercise-mapping.json',
  './data/exercise-guides-final.json',
  './data/exercise-media-targets-final.json',
  './icon-192.png',
  './icon-512.png',
  './chick-mascot.jpg',
  './media/alternating-dumbbell-curl.webp',
  './media/alternating-dumbbell-curl.mp4',
  './media/barbell-wrist-curl.gif',
  './media/bayesian-cable-curl.mp4',
  './media/bird-dog.mp4',
  './media/bulgarian-split-squat.webp',
  './media/cable-crunch.webp',
  './media/cable-external-rotation.gif',
  './media/cable-pallof-press.webp',
  './media/cable-pull-through.webp',
  './media/cable-reverse-curl.webp',
  './media/cable-reverse-wrist-curl.gif',
  './media/cable-serratus-punch.svg',
  './media/cable-wrist-curl.webp',
  './media/cable-y-raise.webp',
  './media/chest-supported-h-row.webp',
  './media/chest-supported-machine-row.mp4',
  './media/decline-machine-fly.mp4',
  './media/dumbbell-hammer-curl.webp',
  './media/dumbbell-heavy-hold.mp4',
  './media/dumbbell-romanian-deadlift.webp',
  './media/dumbbell-shrug.gif',
  './media/front-lat-pulldown.webp',
  './media/gentle-chest-stretch.mp4',
  './media/hack-or-pendulum-squat.webp',
  './media/high-to-low-cable-crossover.webp',
  './media/high-to-low-cable-woodchopper.webp',
  './media/hip-hinge-drill.gif',
  './media/incline-dumbbell-curl.webp',
  './media/incline-dumbbell-press.webp',
  './media/incline-machine-chest-press.webp',
  './media/leg-extension.webp',
  './media/leg-press.webp',
  './media/lying-leg-curl.webp',
  './media/lying-machine-chest-press.webp',
  './media/machine-lateral-raise.webp',
  './media/machine-preacher-curl.webp',
  './media/machine-shoulder-press.webp',
  './media/machine-triceps-dip.webp',
  './media/overhead-rope-triceps-extension.webp',
  './media/pec-deck-fly.webp',
  './media/reverse-crunch.webp',
  './media/reverse-pec-deck.webp',
  './media/rope-face-pull.webp',
  './media/rope-straight-arm-pulldown.webp',
  './media/seated-calf-raise.webp',
  './media/seated-machine-chest-press.webp',
  './media/single-arm-cable-lateral-raise.webp',
  './media/single-arm-overhead-cable-triceps-extension.webp',
  './media/standing-calf-raise.webp',
  './media/straight-bar-triceps-pushdown.webp',
  './media/thoracic-extension.mp4',
  './media/wall-chin-tuck.svg',
  './media/wall-slide.gif',
  ...globalThis.AMINO_EXPANDED_MEDIA_FILES
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(
      cached =>
        cached ||
        fetch(event.request).then(response => {
          if (response.ok && new URL(event.request.url).origin === self.location.origin) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
    )
  );
});
