const CACHE_NAME = 'compliance-ai-v1';
const urlsToCache = [
  '/',
  '/ai-skills-experience-compliance',
  '/styles/globals.css',
  '/_next/static/css/app.css',
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          (response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Activate event
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

// Background sync for assessments
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-assessments') {
    event.waitUntil(syncAssessments());
  }
});

async function syncAssessments() {
  // Get pending assessments from IndexedDB
  const pendingAssessments = await getPendingAssessments();
  
  for (const assessment of pendingAssessments) {
    try {
      await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessment)
      });
      
      // Remove from pending after successful sync
      await removePendingAssessment(assessment.id);
    } catch (error) {
      console.error('Failed to sync assessment:', error);
    }
  }
}

// Helper functions for IndexedDB
async function getPendingAssessments() {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['assessments'], 'readonly');
    const store = transaction.objectStore('assessments');
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting pending assessments:', error);
    return [];
  }
}

async function removePendingAssessment(id) {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['assessments'], 'readwrite');
    const store = transaction.objectStore('assessments');
    const request = store.delete(id);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error removing pending assessment:', error);
  }
}

async function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ComplianceAI', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('assessments')) {
        const store = db.createObjectStore('assessments', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('retryCount', 'retryCount', { unique: false });
      }
    };
  });
} 