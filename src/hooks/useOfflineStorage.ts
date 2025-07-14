import { useState, useEffect, useCallback } from 'react';
import { indexedDBManager } from '@/lib/indexedDB';

interface PendingAssessment {
  id: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

export function useOfflineStorage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [pendingAssessments, setPendingAssessments] = useState<PendingAssessment[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      try {
        await indexedDBManager.init();
        setIsInitialized(true);
        await loadPendingAssessments();
      } catch (err) {
        setError('Failed to initialize offline storage');
        console.error('IndexedDB initialization error:', err);
      }
    };

    initDB();
  }, []);

  // Load pending assessments
  const loadPendingAssessments = useCallback(async () => {
    try {
      const assessments = await indexedDBManager.getPendingAssessments();
      setPendingAssessments(assessments);
    } catch (err) {
      setError('Failed to load pending assessments');
      console.error('Error loading pending assessments:', err);
    }
  }, []);

  // Add assessment to offline storage
  const addPendingAssessment = useCallback(async (assessment: Omit<PendingAssessment, 'timestamp' | 'retryCount'>) => {
    try {
      await indexedDBManager.addPendingAssessment(assessment);
      await loadPendingAssessments(); // Refresh the list
      return true;
    } catch (err) {
      setError('Failed to save assessment offline');
      console.error('Error adding pending assessment:', err);
      return false;
    }
  }, [loadPendingAssessments]);

  // Remove assessment from offline storage
  const removePendingAssessment = useCallback(async (id: string) => {
    try {
      await indexedDBManager.removePendingAssessment(id);
      await loadPendingAssessments(); // Refresh the list
      return true;
    } catch (err) {
      setError('Failed to remove assessment');
      console.error('Error removing pending assessment:', err);
      return false;
    }
  }, [loadPendingAssessments]);

  // Update retry count
  const updateRetryCount = useCallback(async (id: string, retryCount: number) => {
    try {
      await indexedDBManager.updateRetryCount(id, retryCount);
      await loadPendingAssessments(); // Refresh the list
      return true;
    } catch (err) {
      setError('Failed to update retry count');
      console.error('Error updating retry count:', err);
      return false;
    }
  }, [loadPendingAssessments]);

  // Clear old assessments
  const clearOldAssessments = useCallback(async (maxAge?: number) => {
    try {
      await indexedDBManager.clearOldAssessments(maxAge);
      await loadPendingAssessments(); // Refresh the list
      return true;
    } catch (err) {
      setError('Failed to clear old assessments');
      console.error('Error clearing old assessments:', err);
      return false;
    }
  }, [loadPendingAssessments]);

  // Check if offline storage is available
  const isOfflineStorageAvailable = useCallback(() => {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }, []);

  return {
    isInitialized,
    pendingAssessments,
    error,
    addPendingAssessment,
    removePendingAssessment,
    updateRetryCount,
    clearOldAssessments,
    loadPendingAssessments,
    isOfflineStorageAvailable,
  };
} 