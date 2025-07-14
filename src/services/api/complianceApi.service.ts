import { 
  MasterComplianceWorker, 
  RemediationAction 
} from '@/types/master-compliance.types';
import { errorHandlingService } from '../../lib/error-handling';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  headers: Record<string, string>;
}

interface WorkerParams {
  page?: number;
  pageSize?: number;
  search?: string;
  complianceStatus?: string;
}

interface UploadResponse {
  success: boolean;
  documentIds: string[];
}

interface AssessmentRequest {
  documentIds: string[];
}

// Define the assessment interface since it's not in the types file
interface SkillsExperienceAssessment {
  id: string;
  workerId: string;
  assessmentType: 'skills' | 'experience' | 'cv';
  assessmentData: any;
  complianceStatus: 'COMPLIANT' | 'BREACH' | 'SERIOUS_BREACH';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  redFlags: number;
  assessmentScore?: number;
  createdAt: string;
  updatedAt: string;
}

class ComplianceApiService {
  private config: ApiConfig = {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.config.headers,
          ...options.headers,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }
      
      // For non-JSON responses (like blobs), return as-is
      return response as unknown as T;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Get workers with pagination and filtering
  async getWorkers(params?: WorkerParams): Promise<PaginatedResponse<MasterComplianceWorker>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.complianceStatus) queryParams.append('complianceStatus', params.complianceStatus);

    return await errorHandlingService.retryWithBackoff(
      () => this.request<PaginatedResponse<MasterComplianceWorker>>(
        `/workers?${queryParams.toString()}`
      ),
      'get_workers',
      3
    );
  }

  // Get single worker assessment
  async getWorkerAssessment(workerId: string): Promise<SkillsExperienceAssessment | null> {
    if (!workerId) {
      throw new Error('Worker ID is required');
    }

    return await errorHandlingService.retryWithBackoff(
      () => this.request<SkillsExperienceAssessment | null>(
        `/workers/${encodeURIComponent(workerId)}/assessment`
      ),
      `get_assessment_${workerId}`,
      2
    );
  }

  // Upload documents for worker
  async uploadDocuments(
    workerId: string,
    documents: File[]
  ): Promise<UploadResponse> {
    if (!workerId) {
      throw new Error('Worker ID is required');
    }

    if (!documents || documents.length === 0) {
      throw new Error('At least one document is required');
    }

    const formData = new FormData();
    documents.forEach((doc, index) => {
      formData.append('documents', doc, doc.name || `document-${index}`);
    });

    return await this.request<UploadResponse>(
      `/workers/${encodeURIComponent(workerId)}/documents`,
      {
        method: 'POST',
        body: formData,
        headers: {
          // Remove Content-Type to let browser set it with boundary
        },
      }
    );
  }

  // Trigger assessment for worker
  async assessWorker(
    workerId: string,
    documentIds: string[]
  ): Promise<SkillsExperienceAssessment> {
    if (!workerId) {
      throw new Error('Worker ID is required');
    }

    if (!documentIds || documentIds.length === 0) {
      throw new Error('At least one document ID is required');
    }

    const requestBody: AssessmentRequest = { documentIds };

    return await errorHandlingService.retryWithBackoff(
      () => this.request<SkillsExperienceAssessment>(
        `/workers/${encodeURIComponent(workerId)}/assess`,
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        }
      ),
      `assess_${workerId}`,
      3
    );
  }

  // Get assessment report
  async getAssessmentReport(
    assessmentId: string,
    format: 'pdf' | 'html' = 'pdf'
  ): Promise<Blob> {
    if (!assessmentId) {
      throw new Error('Assessment ID is required');
    }

    const response = await fetch(
      `${this.config.baseUrl}/assessments/${encodeURIComponent(assessmentId)}/report?format=${format}`,
      {
        headers: this.config.headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Failed to get report: ${response.statusText} - ${errorText}`);
    }

    return await response.blob();
  }

  // Save assessment
  async saveAssessment(
    assessment: SkillsExperienceAssessment
  ): Promise<SkillsExperienceAssessment> {
    if (!assessment) {
      throw new Error('Assessment data is required');
    }

    return await this.request<SkillsExperienceAssessment>(
      '/assessments',
      {
        method: 'POST',
        body: JSON.stringify(assessment),
      }
    );
  }

  // Update assessment
  async updateAssessment(
    assessmentId: string,
    updates: Partial<SkillsExperienceAssessment>
  ): Promise<SkillsExperienceAssessment> {
    if (!assessmentId) {
      throw new Error('Assessment ID is required');
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('Update data is required');
    }

    return await this.request<SkillsExperienceAssessment>(
      `/assessments/${encodeURIComponent(assessmentId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }
    );
  }

  // Add auth token to requests
  setAuthToken(token: string): void {
    if (!token) {
      throw new Error('Auth token is required');
    }
    this.config.headers['Authorization'] = `Bearer ${token}`;
  }

  // Remove auth token
  clearAuthToken(): void {
    delete this.config.headers['Authorization'];
  }

  // Get current config (useful for debugging)
  getConfig(): Readonly<ApiConfig> {
    return { ...this.config };
  }
}

export const complianceApi = new ComplianceApiService(); 