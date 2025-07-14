import { useCallback, useRef, useState, useEffect } from 'react';

interface DocumentWorkerOptions {
  onProgress?: (progress: number) => void;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

interface WorkerMessage {
  type: 'PARSE_DOCUMENT' | 'PARSE_BATCH';
  payload: {
    fileData: ArrayBuffer;
    fileName: string;
    fileType: string;
    batchId?: string;
  }[];
}

interface WorkerResponse {
  type: 'PROGRESS' | 'COMPLETE' | 'ERROR';
  payload: {
    batchId?: string;
    progress?: number;
    result?: any;
    error?: string;
  };
}

export const useDocumentWorker = (options?: DocumentWorkerOptions) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  // Initialize worker
  const initWorker = useCallback(() => {
    if (!workerRef.current) {
      try {
        workerRef.current = new Worker(
          new URL('../workers/documentProcessor.worker.ts', import.meta.url),
          { type: 'module' }
        );

        workerRef.current.addEventListener('message', (event: MessageEvent<WorkerResponse>) => {
          const { type, payload } = event.data;

          switch (type) {
            case 'PROGRESS':
              const progressValue = payload.progress || 0;
              setProgress(progressValue);
              setError(null);
              options?.onProgress?.(progressValue);
              break;

            case 'COMPLETE':
              setIsProcessing(false);
              setProgress(100);
              setError(null);
              options?.onComplete?.(payload.result);
              break;

            case 'ERROR':
              setIsProcessing(false);
              setProgress(0);
              const errorMessage = payload.error || 'Unknown error occurred';
              setError(errorMessage);
              options?.onError?.(errorMessage);
              break;
          }
        });

        workerRef.current.addEventListener('error', (event) => {
          setIsProcessing(false);
          setProgress(0);
          const errorMessage = 'Worker error occurred';
          setError(errorMessage);
          options?.onError?.(errorMessage);
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize worker';
        setError(errorMessage);
        options?.onError?.(errorMessage);
      }
    }
  }, [options]);

  // Process single document
  const processDocument = useCallback(async (file: File) => {
    try {
      initWorker();
      setIsProcessing(true);
      setProgress(0);
      setError(null);

      const arrayBuffer = await file.arrayBuffer();
      
      workerRef.current?.postMessage({
        type: 'PARSE_DOCUMENT',
        payload: [{
          fileData: arrayBuffer,
          fileName: file.name,
          fileType: file.type
        }]
      } as WorkerMessage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process document';
      setError(errorMessage);
      setIsProcessing(false);
      options?.onError?.(errorMessage);
    }
  }, [initWorker, options]);

  // Process batch of documents
  const processBatch = useCallback(async (files: File[]) => {
    try {
      initWorker();
      setIsProcessing(true);
      setProgress(0);
      setError(null);

      const batchId = Date.now().toString();
      const payload = await Promise.all(
        files.map(async (file) => ({
          fileData: await file.arrayBuffer(),
          fileName: file.name,
          fileType: file.type,
          batchId
        }))
      );

      workerRef.current?.postMessage({
        type: 'PARSE_BATCH',
        payload
      } as WorkerMessage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process batch';
      setError(errorMessage);
      setIsProcessing(false);
      options?.onError?.(errorMessage);
    }
  }, [initWorker, options]);

  // Terminate worker
  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setIsProcessing(false);
    setProgress(0);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      terminate();
    };
  }, [terminate]);

  return {
    processDocument,
    processBatch,
    isProcessing,
    progress,
    error,
    terminate
  };
}; 