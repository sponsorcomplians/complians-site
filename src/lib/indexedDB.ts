const DB_NAME = 'ComplianceAI';
const DB_VERSION = 1;
const ASSESSMENTS_STORE = 'assessments';

interface PendingAssessment {
  id: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create assessments store
        if (!db.objectStoreNames.contains(ASSESSMENTS_STORE)) {
          const store = db.createObjectStore(ASSESSMENTS_STORE, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('retryCount', 'retryCount', { unique: false });
        }
      };
    });
  }

  async addPendingAssessment(assessment: Omit<PendingAssessment, 'timestamp' | 'retryCount'>): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([ASSESSMENTS_STORE], 'readwrite');
      const store = transaction.objectStore(ASSESSMENTS_STORE);
      
      const pendingAssessment: PendingAssessment = {
        ...assessment,
        timestamp: Date.now(),
        retryCount: 0
      };

      const request = store.add(pendingAssessment);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingAssessments(): Promise<PendingAssessment[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([ASSESSMENTS_STORE], 'readonly');
      const store = transaction.objectStore(ASSESSMENTS_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removePendingAssessment(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([ASSESSMENTS_STORE], 'readwrite');
      const store = transaction.objectStore(ASSESSMENTS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateRetryCount(id: string, retryCount: number): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([ASSESSMENTS_STORE], 'readwrite');
      const store = transaction.objectStore(ASSESSMENTS_STORE);
      
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const assessment = getRequest.result;
        if (assessment) {
          assessment.retryCount = retryCount;
          const putRequest = store.put(assessment);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async clearOldAssessments(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) await this.init();

    const cutoffTime = Date.now() - maxAge;
    const pendingAssessments = await this.getPendingAssessments();
    
    for (const assessment of pendingAssessments) {
      if (assessment.timestamp < cutoffTime) {
        await this.removePendingAssessment(assessment.id);
      }
    }
  }
}

export const indexedDBManager = new IndexedDBManager();

// Export helper functions for the service worker
export async function getPendingAssessments() {
  return await indexedDBManager.getPendingAssessments();
}

export async function removePendingAssessment(id: string) {
  return await indexedDBManager.removePendingAssessment(id);
}

export async function updateRetryCount(id: string, retryCount: number) {
  return await indexedDBManager.updateRetryCount(id, retryCount);
} 