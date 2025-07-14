import { toast } from "sonner";

// Custom error types
export class ComplianceError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'ComplianceError';
  }
}

export class DocumentParseError extends ComplianceError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'DOCUMENT_PARSE_ERROR', context);
  }
}

export class ValidationError extends ComplianceError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', context);
  }
}

export class AIServiceError extends ComplianceError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'AI_SERVICE_ERROR', context);
  }
}

interface ErrorLogEntry {
  timestamp: Date;
  error: ComplianceError;
  userId?: string;
  workerId?: string;
  documentType?: string;
  action: string;
}

class ErrorHandlingService {
  private errorLog: ErrorLogEntry[] = [];
  private retryAttempts = new Map<string, number>();

  // Log error with context
  logError(error: ComplianceError, action: string, context?: Record<string, any>) {
    const entry: ErrorLogEntry = {
      timestamp: new Date(),
      error,
      action,
      ...context
    };
    this.errorLog.push(entry);
    if (process.env.NODE_ENV === 'development') {
      console.error('Compliance Error:', entry);
    }
    // TODO: Send to external logging service (Sentry, etc.)
  }

  // Get user-friendly error message
  getUserMessage(error: Error): string {
    if (error instanceof DocumentParseError) {
      return "We couldn't read the document properly. Please ensure it's not corrupted and try again.";
    }
    if (error instanceof ValidationError) {
      return "The document doesn't meet the required format. Please check and try again.";
    }
    if (error instanceof AIServiceError) {
      return "Our assessment service is temporarily unavailable. Please try again in a moment.";
    }
    return "An unexpected error occurred. Please try again or contact support.";
  }

  // Retry logic with exponential backoff
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    operationId: string,
    maxRetries: number = 3
  ): Promise<T> {
    const attempts = this.retryAttempts.get(operationId) || 0;
    try {
      const result = await operation();
      this.retryAttempts.delete(operationId);
      return result;
    } catch (error) {
      if (attempts >= maxRetries) {
        this.retryAttempts.delete(operationId);
        throw error;
      }
      const delay = Math.pow(2, attempts) * 1000; // Exponential backoff
      this.retryAttempts.set(operationId, attempts + 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryWithBackoff(operation, operationId, maxRetries);
    }
  }

  // Handle error with appropriate fallback
  async handleError(error: Error, fallbackStrategy?: () => Promise<any>) {
    const userMessage = this.getUserMessage(error);
    toast.error(userMessage);
    if (error instanceof ComplianceError) {
      this.logError(error, error.code, error.context);
    }
    if (fallbackStrategy) {
      try {
        return await fallbackStrategy();
      } catch (fallbackError) {
        console.error('Fallback strategy failed:', fallbackError);
      }
    }
    throw error;
  }

  // Get recent errors for debugging
  getRecentErrors(limit: number = 10): ErrorLogEntry[] {
    return this.errorLog.slice(-limit);
  }
}

export const errorHandlingService = new ErrorHandlingService(); 