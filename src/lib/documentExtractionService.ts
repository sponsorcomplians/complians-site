import { extractDocumentInfo } from './extractDocumentInfo';

export interface ExtractedDocumentData {
  fileName: string;
  documentType: string;
  extractedData: any;
  rawText: string;
  extractionSuccess: boolean;
  errorMessage?: string;
}

export interface UploadedDocumentsSummary {
  cos?: any;
  jobDescription?: any;
  cv?: any;
  references: any[];
  contracts: any[];
  payslips: any[];
  trainingCertificates: any[];
  passports: any[];
  bankStatements: any[];
  rightToWorkChecks: any[];
  otherDocuments: any[];
  missingDocuments: string[];
}

export class DocumentExtractionService {
  
  /**
   * Extract data from a single uploaded file
   */
  static async extractFromFile(file: File): Promise<ExtractedDocumentData> {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('Document extraction is only available in browser environment');
      }

      // Extract text from file (PDF, DOCX, XLSX) with dynamic import
      const { extractTextFromFile } = await import('./extractTextFromFile');
      const rawText = await extractTextFromFile(file);
      
      // Parse the extracted text based on document type
      const extractionResult = extractDocumentInfo(file.name, rawText);
      
      return {
        fileName: file.name,
        documentType: extractionResult.type,
        extractedData: extractionResult.data,
        rawText: rawText,
        extractionSuccess: true
      };
      
    } catch (error) {
      return {
        fileName: file.name,
        documentType: 'unknown',
        extractedData: null,
        rawText: '',
        extractionSuccess: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Extract data from multiple uploaded files and organize by document type
   */
  static async extractFromFiles(files: File[]): Promise<UploadedDocumentsSummary> {
    const summary: UploadedDocumentsSummary = {
      references: [],
      contracts: [],
      payslips: [],
      trainingCertificates: [],
      passports: [],
      bankStatements: [],
      rightToWorkChecks: [],
      otherDocuments: [],
      missingDocuments: []
    };

    const extractionPromises = files.map(file => this.extractFromFile(file));
    const results = await Promise.all(extractionPromises);

    // Organize extracted data by document type
    for (const result of results) {
      if (!result.extractionSuccess) {
        summary.otherDocuments.push(result);
        continue;
      }

      switch (result.documentType) {
        case 'cos':
          summary.cos = result.extractedData;
          break;
        case 'jobDescription':
          summary.jobDescription = result.extractedData;
          break;
        case 'cv':
          summary.cv = result.extractedData;
          break;
        case 'reference':
          summary.references.push(result.extractedData);
          break;
        case 'contract':
          summary.contracts.push(result.extractedData);
          break;
        case 'payslip':
          summary.payslips.push(result.extractedData);
          break;
        case 'certificate':
          summary.trainingCertificates.push(result.extractedData);
          break;
        case 'passport':
          summary.passports.push(result.extractedData);
          break;
        case 'bankStatement':
          summary.bankStatements.push(result.extractedData);
          break;
        case 'rightToWork':
          summary.rightToWorkChecks.push(result.extractedData);
          break;
        default:
          summary.otherDocuments.push(result);
      }
    }

    // Identify missing required documents
    summary.missingDocuments = this.identifyMissingDocuments(summary);

    return summary;
  }

  /**
   * Identify missing required documents for compliance assessment
   */
  private static identifyMissingDocuments(summary: UploadedDocumentsSummary): string[] {
    const missing: string[] = [];

    if (!summary.cos) {
      missing.push('Certificate of Sponsorship (CoS)');
    }
    if (!summary.jobDescription) {
      missing.push('Job Description Document');
    }
    if (!summary.cv) {
      missing.push('CV/Resume');
    }
    if (summary.references.length === 0) {
      missing.push('Reference Letters');
    }
    if (summary.contracts.length === 0) {
      missing.push('Employment Contracts');
    }
    if (summary.payslips.length === 0) {
      missing.push('Payslips');
    }

    return missing;
  }

  /**
   * Generate compliance assessment data from extracted documents
   */
  static generateAssessmentData(summary: UploadedDocumentsSummary) {
    const cos = summary.cos;
    const jobDescription = summary.jobDescription;
    const cv = summary.cv;
    const references = summary.references;
    const contracts = summary.contracts;
    const payslips = summary.payslips;

    return {
      // Worker information
      workerName: cos?.familyName && cos?.givenNames 
        ? `${cos.givenNames} ${cos.familyName}` 
        : cv?.fullName || 'Unknown',
      
      // Job information
      jobTitle: cos?.jobTitle || jobDescription?.jobTitle || 'Unknown',
      socCode: cos?.socCode || 'Unknown',
      assignmentDate: cos?.dateAssigned || 'Unknown',
      
      // Document availability
      hasCoS: !!cos,
      hasJobDescription: !!jobDescription,
      hasCV: !!cv,
      hasReferences: references.length > 0,
      hasContracts: contracts.length > 0,
      hasPayslips: payslips.length > 0,
      
      // Extracted content
      cosDuties: cos?.jobDescriptionSummary || 'Not provided',
      jobDescriptionDuties: jobDescription?.mainDuties?.join(', ') || 'Not provided',
      
      // Missing documents text
      missingDocsText: summary.missingDocuments.length > 0 
        ? `The following required documents are missing: ${summary.missingDocuments.join(', ')}.`
        : 'All required documents have been provided.',
      
      // Inconsistencies (placeholder for now)
      inconsistencies: this.detectInconsistencies(summary),
      
      // Raw extracted data for detailed analysis
      extractedData: summary
    };
  }

  /**
   * Detect inconsistencies between documents
   */
  private static detectInconsistencies(summary: UploadedDocumentsSummary): string {
    const inconsistencies: string[] = [];
    
    const cos = summary.cos;
    const cv = summary.cv;
    const references = summary.references;
    const contracts = summary.contracts;
    const payslips = summary.payslips;

    // Check for name inconsistencies
    if (cos && cv) {
      const cosName = `${cos.givenNames} ${cos.familyName}`.toLowerCase();
      const cvName = cv.fullName.toLowerCase();
      if (cosName !== cvName) {
        inconsistencies.push('Name mismatch between CoS and CV');
      }
    }

    // Check for job title inconsistencies
    if (cos && contracts.length > 0) {
      const cosTitle = cos.jobTitle?.toLowerCase();
      const contractTitle = contracts[0].jobTitle?.toLowerCase();
      if (cosTitle && contractTitle && cosTitle !== contractTitle) {
        inconsistencies.push('Job title mismatch between CoS and employment contract');
      }
    }

    // Check for salary inconsistencies
    if (cos && payslips.length > 0) {
      const cosSalary = parseFloat(cos.grossSalary?.replace(/[£,]/g, '') || '0');
      const payslipSalary = parseFloat(payslips[0].grossPay?.replace(/[£,]/g, '') || '0');
      if (cosSalary > 0 && payslipSalary > 0 && Math.abs(cosSalary - payslipSalary) > 100) {
        inconsistencies.push('Salary discrepancy between CoS and payslip');
      }
    }

    return inconsistencies.length > 0 
      ? inconsistencies.join('; ')
      : 'No significant inconsistencies detected';
  }

  /**
   * Validate document quality and completeness
   */
  static validateDocumentQuality(summary: UploadedDocumentsSummary) {
    const issues: string[] = [];

    // Check reference letter quality
    summary.references.forEach((ref, index) => {
      if (!ref.letterhead) {
        issues.push(`Reference letter ${index + 1}: Not on company letterhead`);
      }
      if (!ref.refereeEmail || !ref.refereePhone) {
        issues.push(`Reference letter ${index + 1}: Missing referee contact details`);
      }
    });

    // Check payslip completeness
    summary.payslips.forEach((payslip, index) => {
      if (!payslip.grossPay || !payslip.netPay) {
        issues.push(`Payslip ${index + 1}: Missing salary information`);
      }
    });

    // Check contract completeness
    summary.contracts.forEach((contract, index) => {
      if (!contract.salary || !contract.duties) {
        issues.push(`Employment contract ${index + 1}: Missing key terms`);
      }
    });

    return issues;
  }
} 