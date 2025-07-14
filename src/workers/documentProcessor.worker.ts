/// <reference lib="webworker" />
// documentProcessor.worker.ts
import { documentParserService } from '../lib/documentParser.service';

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

const ctx: DedicatedWorkerGlobalScope = self as any;

// Listen for messages
ctx.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'PARSE_DOCUMENT':
      await processSingleDocument(payload[0]);
      break;
    case 'PARSE_BATCH':
      await processBatch(payload);
      break;
  }
});

async function processSingleDocument(fileData: WorkerMessage['payload'][0]) {
  try {
    ctx.postMessage({
      type: 'PROGRESS',
      payload: { progress: 0 }
    } as WorkerResponse);

    const file = new File([fileData.fileData], fileData.fileName, {
      type: fileData.fileType
    });

    const result = await documentParserService.parseDocument(file);

    ctx.postMessage({
      type: 'COMPLETE',
      payload: { result }
    } as WorkerResponse);
  } catch (error) {
    ctx.postMessage({
      type: 'ERROR',
      payload: { 
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    } as WorkerResponse);
  }
}

async function processBatch(files: WorkerMessage['payload']) {
  const total = files.length;
  const results: Array<{ fileName: string; result?: any; error?: string }> = [];

  for (let i = 0; i < files.length; i++) {
    try {
      ctx.postMessage({
        type: 'PROGRESS',
        payload: { 
          progress: ((i + 1) / total) * 100,
          batchId: files[i].batchId
        }
      } as WorkerResponse);

      const file = new File([files[i].fileData], files[i].fileName, {
        type: files[i].fileType
      });

      const result = await documentParserService.parseDocument(file);
      results.push({ fileName: files[i].fileName, result });
    } catch (error) {
      results.push({ 
        fileName: files[i].fileName, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  ctx.postMessage({
    type: 'COMPLETE',
    payload: { 
      result: results,
      batchId: files[0]?.batchId
    }
  } as WorkerResponse);
} 