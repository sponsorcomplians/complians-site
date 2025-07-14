import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface WebhookPayload {
  event: 'document.updated' | 'assessment.completed' | 'compliance.changed';
  data: {
    workerId: string;
    documentId?: string;
    assessmentId?: string;
    previousStatus?: string;
    newStatus?: string;
    timestamp: string;
  };
}

interface WebhookQueueItem {
  id: string;
  payload: WebhookPayload;
  attempts: number;
  nextRetry: Date;
  createdAt: Date;
}

interface NotificationData {
  workerId: string;
  assessmentId?: string;
  previousStatus?: string;
  newStatus?: string;
  timestamp: string;
}

// In-memory queue for failed webhooks (use Redis in production)
const webhookQueue: Map<string, WebhookQueueItem> = new Map();

// Verify webhook signature
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

// Process webhook with better error handling
async function processWebhook(payload: WebhookPayload): Promise<void> {
  console.log(`Processing webhook: ${payload.event}`, {
    workerId: payload.data.workerId,
    timestamp: payload.data.timestamp
  });
  
  try {
    switch (payload.event) {
      case 'document.updated':
        await triggerReassessment(payload.data.workerId);
        break;
        
      case 'assessment.completed':
        await sendAssessmentNotification(payload.data);
        break;
        
      case 'compliance.changed':
        await handleComplianceChange(payload.data);
        break;
        
      default:
        throw new Error(`Unknown webhook event: ${payload.event}`);
    }
    
    console.log(`Successfully processed webhook: ${payload.event}`);
  } catch (error) {
    console.error(`Failed to process webhook ${payload.event}:`, error);
    throw error; // Re-throw to trigger retry logic
  }
}

async function triggerReassessment(workerId: string): Promise<void> {
  if (!workerId) {
    throw new Error('Worker ID is required for reassessment');
  }
  
  // Implementation to trigger reassessment
  console.log(`Triggering reassessment for worker: ${workerId}`);
  
  // Add your reassessment logic here
  // Example: await reassessmentService.trigger(workerId);
}

async function sendAssessmentNotification(data: NotificationData): Promise<void> {
  if (!data.workerId) {
    throw new Error('Worker ID is required for notification');
  }
  
  // Implementation to send notifications
  console.log(`Sending assessment notification:`, {
    workerId: data.workerId,
    assessmentId: data.assessmentId,
    timestamp: data.timestamp
  });
  
  // Add your notification logic here
  // Example: await notificationService.send(data);
}

async function handleComplianceChange(data: NotificationData): Promise<void> {
  if (!data.workerId) {
    throw new Error('Worker ID is required for compliance handling');
  }
  
  // Implementation to handle compliance changes
  console.log(`Handling compliance change:`, {
    workerId: data.workerId,
    previousStatus: data.previousStatus,
    newStatus: data.newStatus,
    timestamp: data.timestamp
  });
  
  if (data.newStatus === 'SERIOUS_BREACH') {
    // Send urgent notification
    console.log('URGENT: Serious breach detected!');
    // await urgentNotificationService.send(data);
  }
  
  // Add your compliance change logic here
}

// Retry failed webhooks with improved logic
async function retryWebhook(item: WebhookQueueItem): Promise<void> {
  try {
    await processWebhook(item.payload);
    webhookQueue.delete(item.id);
    console.log(`Successfully retried webhook ${item.id}`);
  } catch (error) {
    item.attempts++;
    
    if (item.attempts >= 5) {
      console.error(`Webhook ${item.id} failed after 5 attempts:`, error);
      webhookQueue.delete(item.id);
      // Log to dead letter queue or monitoring service
      await logToDeadLetterQueue(item, error);
    } else {
      // Exponential backoff with jitter
      const backoffMs = Math.pow(2, item.attempts) * 1000 + Math.random() * 1000;
      item.nextRetry = new Date(Date.now() + backoffMs);
      webhookQueue.set(item.id, item);
      console.log(`Scheduled retry for webhook ${item.id} in ${backoffMs}ms`);
    }
  }
}

async function logToDeadLetterQueue(item: WebhookQueueItem, error: any): Promise<void> {
  // Implementation to log failed webhooks
  console.error('Dead letter queue entry:', {
    id: item.id,
    payload: item.payload,
    attempts: item.attempts,
    error: error instanceof Error ? error.message : 'Unknown error',
    createdAt: item.createdAt
  });
}

// Process retry queue (run periodically)
setInterval(() => {
  const now = new Date();
  const retryCount = webhookQueue.size;
  
  if (retryCount > 0) {
    console.log(`Processing ${retryCount} queued webhooks`);
  }
  
  webhookQueue.forEach((item) => {
    if (item.nextRetry <= now) {
      retryWebhook(item);
    }
  });
}, 5000);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-webhook-signature');
    const webhookSecret = process.env.WEBHOOK_SECRET;
    
    if (!signature || !webhookSecret) {
      console.error('Missing webhook signature or secret');
      return NextResponse.json(
        { error: 'Missing signature or secret' },
        { status: 401 }
      );
    }
    
    // Verify signature
    if (!verifyWebhookSignature(body, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    let payload: WebhookPayload;
    try {
      payload = JSON.parse(body);
    } catch (error) {
      console.error('Invalid JSON payload:', error);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }
    
    // Validate payload structure
    if (!payload.event || !payload.data || !payload.data.workerId) {
      console.error('Invalid payload structure:', payload);
      return NextResponse.json(
        { error: 'Invalid payload structure' },
        { status: 400 }
      );
    }
    
    // Log webhook event
    console.log(`Received webhook: ${payload.event}`, {
      workerId: payload.data.workerId,
      timestamp: payload.data.timestamp
    });
    
    // Process webhook asynchronously
    processWebhook(payload).catch(error => {
      console.error('Webhook processing failed:', error);
      
      // Add to retry queue
      const queueItem: WebhookQueueItem = {
        id: crypto.randomUUID(),
        payload,
        attempts: 1,
        nextRetry: new Date(Date.now() + 2000), // Retry in 2 seconds
        createdAt: new Date()
      };
      
      webhookQueue.set(queueItem.id, queueItem);
      console.log(`Added webhook ${queueItem.id} to retry queue`);
    });
    
    // Return immediately to acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
} 