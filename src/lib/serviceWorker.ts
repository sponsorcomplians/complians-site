export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/sw.js';

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New content is available, show update prompt
                    console.log('New content is available; please refresh.');
                    // You can show a notification to the user here
                  } else {
                    // Content is cached for offline use
                    console.log('Content is cached for offline use.');
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Error during service worker registration:', error);
        });
    });
  }
}

export function unregisterServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

// Request background sync for assessments
export async function requestAssessmentSync() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      // Check if sync API is available
      if ('sync' in registration) {
        await (registration as any).sync.register('sync-assessments');
        console.log('Background sync for assessments requested');
      } else {
        console.log('Background sync not supported');
      }
    } catch (error) {
      console.error('Failed to request background sync:', error);
    }
  }
}

// Check if service worker is supported
export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

// Get service worker registration
export async function getServiceWorkerRegistration() {
  if (isServiceWorkerSupported()) {
    return await navigator.serviceWorker.ready;
  }
  return null;
} 