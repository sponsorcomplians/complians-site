"use client";

import { useState, useRef, useEffect } from "react";
import {
  BarChart3,
  Users,
  FileText,
  MessageSquare,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bot,
  FileCheck,
  Clock,
  Download,
  Eye,
  Send,
  Mail,
  Printer,
  Plus,
  PieChart,
  HelpCircle,
  GraduationCap,
  Calendar,
  Loader2,
} from "lucide-react";

import { useSearchParams } from 'next/navigation';
import { errorHandlingService, DocumentParseError, ValidationError, AIServiceError } from "@/lib/error-handling";
import { ErrorBoundary } from '@/components/ErrorBoundary';
// REMOVE: import { documentParserService } from '@/lib/documentParser.service';
import { toast } from 'sonner';
import { DocumentPreview } from '@/components/skills-compliance/DocumentProcessor/DocumentPreview';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Types for our data structures
interface SkillsExperienceWorker {
  id: string;
  name: string;
  jobTitle: string;
  socCode: string;
  complianceStatus: "COMPLIANT" | "SERIOUS_BREACH";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  lastAssessment: string;
  redFlag: boolean;
  assignmentDate: string;
  skills: string;
  experience: string;
}

interface SkillsExperienceAssessment {
  id: string;
  workerId: string;
  workerName: string;
  jobTitle: string;
  socCode: string;
  skills: string;
  experience: string;
  complianceStatus: "COMPLIANT" | "SERIOUS_BREACH";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  redFlag: boolean;
  assignmentDate: string;
  professionalAssessment: string;
  generatedAt: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// Custom Card Components
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>{children}</div>
);
const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pb-2 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);
const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

// Custom Button Component
const Button = ({ children, className = "", size = "default", variant = "default", onClick, disabled = false, ...props }: { children: React.ReactNode; className?: string; size?: "default" | "sm"; variant?: "default" | "destructive" | "outline"; onClick?: () => void; disabled?: boolean; [key: string]: any; }) => {
  const sizeClasses = size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2";
  const variantClasses = variant === "destructive"
    ? "bg-red-500 hover:bg-red-600 text-white"
    : variant === "outline"
      ? "border border-gray-300 bg-white hover:bg-gray-50 text-gray-900"
      : "bg-gray-900 hover:bg-gray-800 text-white";
  return (
    <button className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${sizeClasses} ${variantClasses} ${className}`} onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

// Custom Badge Component
const Badge = ({ children, variant = "default", className = "" }: { children: React.ReactNode; variant?: "default" | "outline" | "destructive"; className?: string; }) => {
  const variantClasses = variant === "outline"
    ? "border border-current bg-transparent"
    : variant === "destructive"
      ? "bg-red-500 text-white animate-pulse"
      : "bg-gray-900 text-white";
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variantClasses} ${className}`}>{children}</div>
  );
};

// Custom Tabs Components
const Tabs = ({ children, value, onValueChange, className = "" }: { children: React.ReactNode; value: string; onValueChange: (value: string) => void; className?: string; }) => (
  <div className={className} data-value={value}>{children}</div>
);
const TabsList = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}>{children}</div>
);
const TabsTrigger = ({ children, value, className = '', activeTab, onValueChange }: { children: React.ReactNode; value: string; className?: string; activeTab: string; onValueChange: (value: string) => void; }) => {
  const isActive = activeTab === value;
  return (
    <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${isActive ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500 hover:text-gray-900'} ${className}`} onClick={() => onValueChange(value)}>{children}</button>
  );
};
const TabsContent = ({ children, value, activeTab }: { children: React.ReactNode; value: string; activeTab: string; }) => {
  if (activeTab !== value) return null;
  return <div className="mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2">{children}</div>;
};

// Simple Chart Components
const PieChartComponent = ({ data }: { data: any[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercentage = 0;

  return (
    <div className="flex items-center justify-center">
      <svg width="200" height="200" viewBox="0 0 200 200">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const startAngle = (cumulativePercentage / 100) * 360;
          const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
          
          const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
          const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
          const x2 = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
          const y2 = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
          
          const largeArcFlag = percentage > 50 ? 1 : 0;
          
          const pathData = [
            `M 100 100`,
            `L ${x1} ${y1}`,
            `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');
          
          cumulativePercentage += percentage;
          
          return (
            <path
              key={index}
              d={pathData}
              fill={item.color}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
};

const BarChartComponent = ({ data }: { data: any[] }) => {
  const maxValue = Math.max(...data.map(item => item.value), 1);
  const maxBarHeight = 140; // px, fits well in the card
  return (
    <div className="flex items-end justify-center space-x-2 h-40 max-h-40 overflow-hidden">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center">
          <div 
            className="w-12 bg-green-500 rounded-t"
            style={{ height: `${Math.max(8, (item.value / maxValue) * maxBarHeight)}px` }}
          ></div>
          <span className="text-xs mt-2 text-center">{item.name}</span>
          <span className="text-xs text-gray-500">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

const riskLevelColors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
};

export default function SkillsExperienceComplianceDashboard() {
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [workers, setWorkers] = useState<SkillsExperienceWorker[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hello! I'm your AI compliance assistant. I can help you with questions about skills, experience, CVs, and compliance obligations. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [supabaseClient, setSupabaseClient] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [assessments, setAssessments] = useState<SkillsExperienceAssessment[]>([]);
  const [currentAssessment, setCurrentAssessment] = useState<SkillsExperienceAssessment | null>(null);
  const [selectedWorkerAssessment, setSelectedWorkerAssessment] = useState<SkillsExperienceAssessment | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  const [previewDocument, setPreviewDocument] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [pendingWorkerData, setPendingWorkerData] = useState<any>(null);

  // Load workers from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWorkers = localStorage.getItem('skillsExperienceComplianceWorkers');
      if (savedWorkers) {
        try {
          const parsedWorkers = JSON.parse(savedWorkers);
          setWorkers(parsedWorkers);
        } catch (error) {
          console.error('Error loading saved workers:', error);
        }
      }
    }
  }, []);

  // Save workers to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && workers.length > 0) {
      localStorage.setItem('skillsExperienceComplianceWorkers', JSON.stringify(workers));
    }
  }, [workers]);

  // Load assessments from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAssessments = localStorage.getItem('skillsExperienceComplianceAssessments');
      if (savedAssessments) {
        try {
          const parsedAssessments = JSON.parse(savedAssessments);
          setAssessments(parsedAssessments);
        } catch (error) {
          console.error('Error loading saved assessments:', error);
        }
      }
    }
  }, []);

  // Save assessments to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && assessments.length > 0) {
      localStorage.setItem('skillsExperienceComplianceAssessments', JSON.stringify(assessments));
    }
  }, [assessments]);

  // Dashboard stats
  const dashboardStats = {
    totalWorkers: workers.length,
    complianceRate: Math.round(
      (workers.filter((w) => w.complianceStatus === 'COMPLIANT').length /
        workers.length) *
        100
    ),
    compliantWorkers: workers.filter(
      (w) => w.complianceStatus === 'COMPLIANT'
    ).length,
    redFlags: workers.filter((w) => w.redFlag).length,
    highRisk: workers.filter((w) => w.riskLevel === 'HIGH').length,
  };

  // Chart data - recalculated when workers change
  const pieChartData = [
    { name: 'Compliant', value: workers.filter(w => w.complianceStatus === 'COMPLIANT').length, color: '#10B981' },
    { name: 'Serious Breach', value: workers.filter(w => w.complianceStatus === 'SERIOUS_BREACH').length, color: '#EF4444' }
  ];

  const barChartData = [
    { name: 'Low Risk', value: workers.filter(w => w.riskLevel === 'LOW').length },
    { name: 'Medium Risk', value: workers.filter(w => w.riskLevel === 'MEDIUM').length },
    { name: 'High Risk', value: workers.filter(w => w.riskLevel === 'HIGH').length }
  ];

  const complianceStatusColors = {
    COMPLIANT: 'bg-green-500 text-white',
    'SERIOUS_BREACH': 'bg-red-500 text-white',
  };

  // Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const handleChatSend = async () => {
    try {
      await errorHandlingService.retryWithBackoff(
        async () => {
          if (!chatInput.trim()) {
            throw new ValidationError("Message cannot be empty");
          }
          setChatMessages([
            ...chatMessages,
            {
              role: 'user',
              content: chatInput,
              timestamp: new Date().toLocaleTimeString(),
            },
            {
              role: 'assistant',
              content:
                "Thank you for your question. Our AI will review your query and provide guidance on skills and experience compliance.",
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);
          setChatInput('');
        },
        "chat-send"
      );
    } catch (error) {
      await errorHandlingService.handleError(error as Error);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const files = Array.from(event.target.files || []);
      await errorHandlingService.retryWithBackoff(
        async () => {
          // Simulate file parsing/validation
          if (files.some(f => f.size === 0)) {
            throw new DocumentParseError("File is empty", { fileNames: files.map(f => f.name) });
          }
          // ... your file parsing logic ...
          setSelectedFiles(files);
        },
        "file-upload"
      );
    } catch (error) {
      await errorHandlingService.handleError(error as Error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAllFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Enhanced file upload with document parsing and error handling
  const handleFileUpload = async (files: File[]) => {
    setIsUploading(true);
    try {
      for (const file of files) {
        try {
          // Use API route to extract structured data
          const formData = new FormData();
          formData.append('file', file);
          const response = await fetch('/api/parse-pdf', {
            method: 'POST',
            body: formData,
          });
          if (!response.ok) throw new Error('Failed to parse PDF');
          const extracted = await response.json();
          setUploadedDocuments(prev => [...prev, {
            id: Date.now().toString(),
            name: file.name,
            type: file.type,
            size: file.size,
            content: extracted.text,
            extractedData: extracted,
            uploadDate: new Date(),
            file: file // Store file reference for preview
          }]);
          toast.success(`${file.name} uploaded and parsed successfully`);
        } catch (error) {
          await errorHandlingService.handleError(
            error instanceof Error ? error : new Error('Unknown error'),
            async () => {
              // Fallback: Try alternative parsing method
              console.log('Attempting fallback parsing for:', file.name);
            }
          );
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Real document extraction logic using DocumentExtractionService
  const extractSkillsExperienceInfo = async (files: File[]) => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('Document extraction is only available in browser environment');
      }

      // Dynamically import the DocumentExtractionService to avoid SSR issues
      const { DocumentExtractionService } = await import('../lib/documentExtractionService');
      
      // Use the DocumentExtractionService to extract real data from uploaded files
      const documentSummary = await DocumentExtractionService.extractFromFiles(files);
      
      // Generate assessment data from extracted documents
      const assessmentData = DocumentExtractionService.generateAssessmentData(documentSummary);
      
      // Enhanced analysis for the 5-step decision tree
      const hasCV = !!assessmentData.hasCV;
      const hasContracts = !!assessmentData.hasContracts;
      const hasPayslips = !!assessmentData.hasPayslips;
      const hasTraining = !!assessmentData.hasTraining;
      
      // Analyze employment history consistency
      const employmentHistoryConsistent = analyzeEmploymentHistoryConsistency(assessmentData);
      
      // Analyze experience match with duties
      const experienceMatchesDuties = analyzeExperienceMatch(assessmentData);
      
      // Analyze reference credibility
      const referencesCredible = analyzeReferenceCredibility(assessmentData);
      
      // Analyze experience recency and continuity
      const experienceRecentAndContinuous = analyzeExperienceRecency(assessmentData);
      
      // Extract basic worker information with multiple fallback patterns
      // Combine all document texts for extraction
      const allTexts = (documentSummary as any).documents?.map((doc: any) => doc.extractedText || '').join('\n') || '';
      const extractedText = allTexts || JSON.stringify(documentSummary) || assessmentData.extractedData?.toString() || '';
      
      // Try multiple patterns for worker name
      const workerName = assessmentData.workerName || 
                        extractedText.match(/(?:Full\s*)?Name:?\s*([^\n,]+)/i)?.[1]?.trim() ||
                        extractedText.match(/(?:Worker|Employee|Candidate):?\s*([^\n,]+)/i)?.[1]?.trim() ||
                        extractedText.match(/(?:Mr\.|Mrs\.|Ms\.|Miss|Dr\.)\s+([A-Za-z\s]+)/)?.[1]?.trim() ||
                        extractedText.match(/^([A-Z][a-z]+\s+[A-Z][a-z]+)/m)?.[1]?.trim() ||
                        "John Smith"; // Default if no name found
                        
      // Try multiple patterns for job title
      const jobTitle = assessmentData.jobTitle || 
                      extractedText.match(/(?:Job\s*)?(?:Title|Position|Role):?\s*([^\n,]+)/i)?.[1]?.trim() ||
                      extractedText.match(/(?:Applying\s+for|Application\s+for):?\s*([^\n,]+)/i)?.[1]?.trim() ||
                      extractedText.match(/(?:Current\s+)?(?:Position|Role):?\s*([^\n,]+)/i)?.[1]?.trim() ||
                      "Software Engineer"; // Default if no title found
                      
      // Try multiple patterns for SOC code
      const socCode = assessmentData.socCode || 
                     extractedText.match(/SOC\s*(?:Code)?:?\s*(\d{4})/i)?.[1]?.trim() ||
                     extractedText.match(/(?:Code|Reference):?\s*(\d{4})/i)?.[1]?.trim() ||
                     extractedText.match(/\b(\d{4})\b.*?(?:SOC|code)/i)?.[1]?.trim() ||
                     "2136"; // Default SOC code
                     
      const assignmentDate = assessmentData.assignmentDate || 
                            extractedText.match(/(?:Date|Assigned|Start):?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i)?.[1]?.trim() ||
                            new Date().toLocaleDateString('en-GB');
      
      // Log what we extracted for debugging
      console.log('[Extraction Results]', {
        workerName,
        jobTitle,
        socCode,
        assignmentDate,
        textLength: extractedText.length,
        firstHundredChars: extractedText.substring(0, 100)
      });
      
      return {
        workerName: workerName,
        jobTitle: jobTitle,
        socCode: socCode,
        assignmentDate: assignmentDate,
        skills: (assessmentData as any).skills || extractedText.match(/(?:Skills|Competencies|Expertise):?\s*([^\n]+)/i)?.[1]?.trim() || "Relevant technical skills as per job description",
        experience: (assessmentData as any).experience || extractedText.match(/(?:Experience|Background|History):?\s*([^\n]+)/i)?.[1]?.trim() || "Professional experience in the field",
        // Additional extracted data for assessment
        cosDuties: (assessmentData as any).cosDuties || "Duties as specified in the Certificate of Sponsorship",
        jobDescriptionDuties: (assessmentData as any).jobDescriptionDuties || "Responsibilities outlined in the job description",
        hasJobDescription: assessmentData.hasJobDescription,
        hasCV: hasCV,
        hasReferences: assessmentData.hasReferences,
        hasContracts: hasContracts,
        hasPayslips: hasPayslips,
        hasTraining: hasTraining,
        employmentHistoryConsistent: employmentHistoryConsistent,
        experienceMatchesDuties: experienceMatchesDuties,
        referencesCredible: referencesCredible,
        experienceRecentAndContinuous: experienceRecentAndContinuous,
        missingDocsText: assessmentData.missingDocsText,
        inconsistencies: assessmentData.inconsistencies,
        missingDocs: documentSummary.missingDocuments,
        // Raw extracted data for detailed analysis
        extractedData: assessmentData.extractedData
      };
    } catch (error) {
      console.error('Error extracting document information:', error);
      // Fallback to default data if extraction fails
      return {
        workerName: "John Smith",
        jobTitle: "Software Engineer",
        socCode: "2136",
        assignmentDate: new Date().toLocaleDateString('en-GB'),
        skills: "Technical skills relevant to the position",
        experience: "Professional experience in software development",
        cosDuties: "Develop and maintain software applications",
        jobDescriptionDuties: "Design, code, test and debug software systems",
        hasJobDescription: false,
        hasCV: false,
        hasReferences: false,
        hasContracts: false,
        hasPayslips: false,
        hasTraining: false,
        employmentHistoryConsistent: false,
        experienceMatchesDuties: false,
        referencesCredible: false,
        experienceRecentAndContinuous: false,
        missingDocsText: "Document extraction failed",
        inconsistencies: "Unable to detect inconsistencies",
        missingDocs: ["All documents"],
        extractedData: null
      };
    }
  };

  // Helper functions for enhanced analysis
  const analyzeEmploymentHistoryConsistency = (assessmentData: any): boolean => {
    // This would analyze dates, gaps, and progression across CV, references, and contracts
    // For now, return true if we have multiple document types
    return assessmentData.hasCV && assessmentData.hasReferences && assessmentData.hasContracts;
  };

  const analyzeExperienceMatch = (assessmentData: any): boolean => {
    // This would compare CV duties with CoS and job description duties
    // For now, return true if we have both CV and job description
    return assessmentData.hasCV && assessmentData.hasJobDescription;
  };

  const analyzeReferenceCredibility = (assessmentData: any): boolean => {
    // This would check for letterhead, signatures, contact details, etc.
    // For now, return true if we have references
    return assessmentData.hasReferences;
  };

  const analyzeExperienceRecency = (assessmentData: any): boolean => {
    // This would check dates to ensure recent and continuous experience
    // For now, return true if we have recent employment evidence
    return assessmentData.hasContracts || assessmentData.hasPayslips;
  };

  // Enhanced assessment logic for skills & experience with comprehensive decision tree
  const generateSkillsExperienceAssessment = async (
    info: {
      workerName: string;
      cosReference: string;
      assignmentDate: string;
      jobTitle: string;
      socCode: string;
      cosDuties: string;
      jobDescriptionDuties: string;
      hasJobDescription: boolean;
      hasCV: boolean;
      hasReferences: boolean;
      hasContracts: boolean;
      hasPayslips: boolean;
      hasTraining: boolean;
      employmentHistoryConsistent: boolean;
      experienceMatchesDuties: boolean;
      referencesCredible: boolean;
      experienceRecentAndContinuous: boolean;
      inconsistenciesDescription?: string;
      missingDocs: string[];
    }
  ): Promise<{
    complianceStatus: "COMPLIANT" | "SERIOUS_BREACH";
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    redFlag: boolean;
    professionalAssessment: string;
    auditId?: string;
  }> => {
    // Step 1: Check if all required documents are provided
    const step1Pass = info.hasJobDescription && info.hasCV && info.hasReferences && 
                     info.hasContracts && info.hasPayslips && info.hasTraining;
    
    // Step 2: Check employment history consistency
    const step2Pass = info.employmentHistoryConsistent;
    
    // Step 3: Check if experience matches CoS duties
    const step3Pass = info.experienceMatchesDuties;
    
    // Step 4: Check if references are credible and independent
    const step4Pass = info.referencesCredible;
    
    // Step 5: Check if experience is recent and continuous
    const step5Pass = info.experienceRecentAndContinuous;

    // Overall compliance decision
    const isCompliant = step1Pass && step2Pass && step3Pass && step4Pass && step5Pass;

    // Determine risk level based on number of failures
    const failures = [step1Pass, step2Pass, step3Pass, step4Pass, step5Pass].filter(pass => !pass).length;
    let riskLevel: "LOW" | "MEDIUM" | "HIGH";
    if (failures === 0) {
      riskLevel = "LOW";
    } else if (failures <= 2) {
      riskLevel = "MEDIUM";
    } else {
      riskLevel = "HIGH";
    }

    let narrative: string;
    const aiStartTime = Date.now();
    
    try {
      // Use the new simplified API v2
      console.log('[SkillsExperienceComp] Calling generate-narrative-v2 API');
      
      const requestBody = {
        workerName: info.workerName,
        cosReference: info.cosReference,
        assignmentDate: info.assignmentDate,
        jobTitle: info.jobTitle,
        socCode: info.socCode,
        cosDuties: info.cosDuties,
        jobDescriptionDuties: info.jobDescriptionDuties,
        missingDocs: info.missingDocs,
        employmentHistoryConsistent: info.employmentHistoryConsistent,
        experienceMatchesDuties: info.experienceMatchesDuties,
        referencesCredible: info.referencesCredible,
        experienceRecentAndContinuous: info.experienceRecentAndContinuous,
        inconsistenciesDescription: info.inconsistenciesDescription
      };
      
      console.log('[SkillsExperienceComp] Simplified request:', requestBody);
      
      const response = await fetch('/api/generate-narrative-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('[SkillsExperienceComp] Response status:', response.status);
      console.log('[SkillsExperienceComp] Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('[SkillsExperienceComp] API response:', data);
      
      if (!data.success || !data.narrative) {
        throw new Error(data.error || 'Failed to generate narrative');
      }
      
      narrative = data.narrative;
      console.log('[SkillsExperienceComp] Narrative generated successfully');
    } catch (error) {
      console.error('[SkillsExperienceComp] Error in AI narrative generation:', error);
      
      // Show user-friendly error notification
      toast.info('Using template-based assessment', {
        description: 'AI narrative generation is currently unavailable.',
        duration: 3000
      });
      
      // Log fallback usage
      try {
        const { narrativeMetrics } = await import('@/lib/narrativeMetrics');
        await narrativeMetrics.logGeneration({
          id: `NAR_${Date.now()}`,
          timestamp: new Date().toISOString(),
          input: { ...info, step1Pass, step2Pass, step3Pass, step4Pass, step5Pass, isCompliant, riskLevel },
          output: '',
          model: 'fallback',
          promptVersion: '1.0.0',
          temperature: 0,
          duration: Date.now() - aiStartTime,
          tokenCount: 0,
          validationPassed: true,
          fallbackUsed: true,
          costEstimate: 0
        });
      } catch (metricsError) {
        console.error('Failed to log metrics:', metricsError);
      }
      
      // Use existing template literal as fallback
      narrative = `
[Your Company Letterhead]

[Date]

[Recipient Name/Title]
[Recipient Address]

Subject: Skills and Experience Compliance Assessment - ${info.workerName}

Dear [Recipient Name/Title],

Following a detailed review of the documents you have provided, serious concerns have been identified regarding your assignment of the Certificate of Sponsorship (CoS) for roles under Standard Occupational Classification (SOC) code ${info.socCode} (${info.jobTitle}). The evidence suggests that you have not adequately assessed or verified the skills and experience of the sponsored worker prior to assigning the CoS. This constitutes a significant breach of your sponsor duties under the Workers and Temporary Workers: Guidance for Sponsors.

A Certificate of Sponsorship (CoS) was assigned to ${info.workerName} (${info.cosReference}) on ${info.assignmentDate} to work as a ${info.jobTitle}. The summary of job description in your CoS states: ${info.cosDuties}. In addition, your job description states that your main duties and responsibilities include: ${info.jobDescriptionDuties}.

Upon examining the submitted documentation, we note that ${info.missingDocs.length === 0
  ? "all required supporting documents have been provided, including the CoS, job description, CV, references, employment contracts, payslips, and training certificates, demonstrating a comprehensive record of assessment"
  : `certain required documents have not been provided, including ${info.missingDocs.join(", ")}, thereby undermining the evidence of a thorough compliance check as required under Appendix D.`}

Our analysis of the worker's employment history revealed ${info.employmentHistoryConsistent
  ? "a consistent and logical progression toward the current role, with no unexplained gaps or inconsistencies"
  : "significant inconsistencies and unexplained gaps, raising concerns about the authenticity of the claimed experience and whether the worker has maintained relevant skills"}.

A review of the worker's prior roles and duties suggests that ${info.experienceMatchesDuties
  ? "the experience aligns closely with the tasks described in the CoS and job description, indicating practical readiness for the role"
  : "the experience does not match the specific duties required, with past roles appearing unrelated or insufficiently detailed to support the current appointment"}.

We further note that the reference letters provided were ${info.referencesCredible
  ? "credible and independently prepared, containing specific details of duties, dates, and performance, thus supporting the claimed experience"
  : "lacking credibility, with concerns such as missing signatures, absence of official letterheads, or the appearance of being prepared by non-independent parties"}.

Regarding the recency and continuity of experience, the evidence indicates that ${info.experienceRecentAndContinuous
  ? "the worker has been continuously active in the relevant sector up to the CoS assignment date, reinforcing confidence in their current skills"
  : "the worker's experience is not recent or continuous, with long breaks or sector switches undermining confidence in their suitability for the role"}.

${info.missingDocs.length > 0 ? `In addition to the above concerns, we note that certain key documents, including ${info.missingDocs.join(", ")}, have not been provided. Under Annex C2(g) of the sponsor guidance:\n\n"You fail to provide to us, when requested and within the time limit given, either: • a document specified in Appendix D to the sponsor guidance • specified evidence you were required to keep for workers sponsored under the shortage occupation provisions in Appendix K to the Immigration Rules in force before 1 December 2020."\n` : ""}

Based on these findings, the Home Office would conclude that you have breached paragraph C1.38 of the Workers and Temporary Workers: Guidance for Sponsors (version 12/24), which clearly states:

"Sponsors must not employ a worker where they do not believe the worker will comply with the conditions of their permission to stay, or where they have reasonable grounds to believe the worker does not have the necessary skills, qualifications, or professional accreditations to do the job in question."

This represents a serious breach of sponsor compliance obligations and may result in licence suspension or revocation under Annex C1 (reference w) and Annex C2 (reference a) of the sponsor guidance.

Compliance Verdict: ${isCompliant ? 'COMPLIANT' : 'SERIOUS BREACH'} — ${isCompliant ? 'assessment indicates compliance with sponsor duties' : 'immediate remedial action is required, including a full internal audit of assigned CoS, review of experience evidence and job descriptions, and corrective reporting to the Home Office to mitigate enforcement risks'}.
`;
    }

    return {
      complianceStatus: isCompliant ? "COMPLIANT" : "SERIOUS_BREACH",
      riskLevel: riskLevel,
      redFlag: !isCompliant,
      professionalAssessment: narrative.trim(),
    };
  };

  // Analyze button handler
  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one document to upload.');
      return;
    }
    try {
      // Extract real data from uploaded documents
      const extracted = await extractSkillsExperienceInfo(selectedFiles);
      
      // Log extracted data for debugging
      console.log('[handleAnalyze] Extracted data:', extracted);
      
      // Show worker form with pre-filled data for user confirmation
      setPendingWorkerData({
        workerName: extracted.workerName || '',
        jobTitle: extracted.jobTitle || '',
        socCode: extracted.socCode || '',
        assignmentDate: extracted.assignmentDate || new Date().toISOString().split('T')[0],
        // Store all extracted data for later use
        extractedData: extracted
      });
      setShowWorkerForm(true);
    } catch (error) {
      await errorHandlingService.handleError(error as Error);
    }
  };

  // Generate assessment with manually confirmed data
  const generateAssessmentWithData = async (workerData: any) => {
    try {
      await errorHandlingService.retryWithBackoff(
        async () => {
          const extracted = workerData.extractedData || {};
          
          // Use manually entered data, falling back to extracted data
          const finalWorkerName = workerData.workerName || extracted.workerName || 'Unknown Worker';
          const finalJobTitle = workerData.jobTitle || extracted.jobTitle || 'Unknown Position';
          const finalSocCode = workerData.socCode || extracted.socCode || 'Unknown';
          const finalAssignmentDate = workerData.assignmentDate || extracted.assignmentDate || new Date().toISOString().split('T')[0];
          
          console.log('[generateAssessmentWithData] Using worker data:', {
            workerName: finalWorkerName,
            jobTitle: finalJobTitle,
            socCode: finalSocCode,
            assignmentDate: finalAssignmentDate
          });
          
          // Generate assessment using extracted data with enhanced logic
          const assessmentResult = await generateSkillsExperienceAssessment({
            workerName: finalWorkerName,
            cosReference: 'COS_' + Date.now(),
            assignmentDate: finalAssignmentDate,
            jobTitle: finalJobTitle,
            socCode: finalSocCode,
            cosDuties: extracted.cosDuties || 'Not provided',
            jobDescriptionDuties: extracted.jobDescriptionDuties || 'Not provided',
            hasJobDescription: extracted.hasJobDescription || false,
            hasCV: extracted.hasCV || false,
            hasReferences: extracted.hasReferences || false,
            hasContracts: extracted.hasContracts || false,
            hasPayslips: extracted.hasPayslips || false,
            hasTraining: extracted.hasTraining || false,
            employmentHistoryConsistent: extracted.employmentHistoryConsistent || false,
            experienceMatchesDuties: extracted.experienceMatchesDuties || false,
            referencesCredible: extracted.referencesCredible || false,
            experienceRecentAndContinuous: extracted.experienceRecentAndContinuous || false,
            inconsistenciesDescription: extracted.inconsistencies,
            missingDocs: extracted.missingDocs || []
          });
          
          const newAssessment: SkillsExperienceAssessment = {
            id: 'ASSESS_' + Date.now(),
            workerId: 'WORKER_' + Date.now(),
            workerName: finalWorkerName,
            jobTitle: finalJobTitle,
            socCode: finalSocCode,
            skills: extracted.skills || 'To be assessed',
            experience: extracted.experience || 'To be assessed',
            complianceStatus: assessmentResult.complianceStatus,
            riskLevel: assessmentResult.riskLevel,
            redFlag: assessmentResult.redFlag,
            assignmentDate: finalAssignmentDate,
            professionalAssessment: assessmentResult.professionalAssessment,
            generatedAt: new Date().toISOString()
          };
          
          // Add worker with manually confirmed data
          const newWorker: SkillsExperienceWorker = {
            id: newAssessment.workerId,
            name: finalWorkerName,
            jobTitle: finalJobTitle,
            socCode: finalSocCode,
            complianceStatus: assessmentResult.complianceStatus,
            riskLevel: assessmentResult.riskLevel,
            lastAssessment: new Date().toISOString().split('T')[0],
            redFlag: assessmentResult.redFlag,
            assignmentDate: finalAssignmentDate,
            skills: extracted.skills || 'To be assessed',
            experience: extracted.experience || 'To be assessed'
          };
          
          // Log the new worker being added
          console.log('[generateAssessmentWithData] Adding new worker:', newWorker);
          
          setWorkers(prev => {
            const updated = [...prev, newWorker];
            console.log('[generateAssessmentWithData] Updated workers list:', updated);
            return updated;
          });
          setAssessments(prev => [...prev, newAssessment]);
          setCurrentAssessment(newAssessment);
          setSelectedFiles([]);
          if (fileInputRef.current) fileInputRef.current.value = '';
          setActiveTab('assessment');
          setPendingWorkerData(null);
          
          // Log audit information if available
          if (assessmentResult.auditId) {
            console.log(`Assessment generated with audit ID: ${assessmentResult.auditId}`);
          }
        },
        `ai-assessment-${new Date().toISOString()}`
      );
    } catch (error) {
      await errorHandlingService.handleError(error as Error);
    }
  };

  // PDF generation (adapted)
  const handleDownloadPDF = async () => {
    if (!currentAssessment && !selectedWorkerAssessment) {
      alert('No assessment report available to download.');
      return;
    }
    const assessment = currentAssessment || selectedWorkerAssessment;
    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text('Skills & Experience Compliance Analysis Report', 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`, 105, 30, { align: 'center' });
      if (assessment?.redFlag) {
        doc.setFillColor(239, 68, 68);
        doc.rect(10, 40, 190, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text('SERIOUS BREACH DETECTED - Immediate review required', 105, 50, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }
      let yPos = assessment?.redFlag ? 70 : 50;
      doc.setFontSize(14);
      doc.text('Assessment Summary', 10, yPos);
      yPos += 10;
      doc.setFontSize(10);
      doc.text(`Worker: ${assessment?.workerName}`, 10, yPos); yPos += 7;
      doc.text(`Job Title: ${assessment?.jobTitle}`, 10, yPos); yPos += 7;
      doc.text(`SOC Code: ${assessment?.socCode}`, 10, yPos); yPos += 7;
      doc.text(`Skills: ${assessment?.skills}`, 10, yPos); yPos += 7;
      doc.text(`Experience: ${assessment?.experience}`, 10, yPos); yPos += 7;
      doc.text(`Status: ${assessment?.complianceStatus}`, 10, yPos); yPos += 15;
      doc.setFontSize(14);
      doc.text('Professional Assessment', 10, yPos); yPos += 10;
      doc.setFontSize(9);
      const assessmentLines = doc.splitTextToSize(assessment?.professionalAssessment || '', 180);
      assessmentLines.forEach((line: string) => {
        if (yPos > 270) { doc.addPage(); yPos = 20; }
        doc.text(line, 10, yPos); yPos += 5;
      });
      doc.save(`Skills_Experience_Compliance_Report_${assessment?.workerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Email report (adapted)
  const handleEmailReport = async () => {
    if (!currentAssessment && !selectedWorkerAssessment) {
      alert('No assessment report available to email.');
      return;
    }
    const assessment = currentAssessment || selectedWorkerAssessment;
    const emailHTML = `
      <h2>Skills & Experience Compliance Assessment Report</h2>
      <p><strong>Worker:</strong> ${assessment?.workerName}</p>
      <p><strong>Status:</strong> ${assessment?.complianceStatus}</p>
      <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
      <hr>
      <div>${assessment?.professionalAssessment.replace(/\n/g, '<br>')}</div>
    `;
    try {
      const response = await fetch('/api/send-report-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail || prompt('Enter email address:') || 'compliance@company.com',
          subject: `Skills & Experience Compliance Assessment Report - ${assessment?.workerName}`,
          html: emailHTML,
          workerName: assessment?.workerName,
        }),
      });
      if (!response.ok) throw new Error('Failed to send email');
      alert('Report sent successfully via email!');
    } catch (error) {
      const subject = `Skills & Experience Compliance Assessment Report - ${assessment?.workerName}`;
      const body = `Please find the skills & experience compliance assessment report for ${assessment?.workerName}.

${assessment?.professionalAssessment}`;
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      if (typeof window !== 'undefined') {
        window.open(mailtoLink);
        alert('Email service not configured. Opening your email client instead.');
      }
    }
  };

  // Print report
  const handlePrintReport = () => {
    if (!currentAssessment && !selectedWorkerAssessment) {
      alert('No assessment report available to print.');
      return;
    }
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // View specific worker report
  const handleViewWorkerReport = (workerId: string) => {
    const workerAssessment = assessments.find(a => a.workerId === workerId);
    if (workerAssessment) {
      setSelectedWorkerAssessment(workerAssessment);
      setActiveTab('assessment');
    } else {
      const worker = workers.find(w => w.id === workerId);
      if (worker) {
        const mockAssessment: SkillsExperienceAssessment = {
          id: 'ASSESS_' + Date.now(),
          workerId: worker.id,
          workerName: worker.name,
          jobTitle: worker.jobTitle,
          socCode: worker.socCode,
          skills: worker.skills,
          experience: worker.experience,
          complianceStatus: worker.complianceStatus,
          riskLevel: worker.riskLevel,
          redFlag: worker.redFlag,
          assignmentDate: worker.assignmentDate,
          professionalAssessment: `Skills & Experience assessment for ${worker.name}`,
          generatedAt: new Date().toISOString()
        };
        setAssessments(prev => [...prev, mockAssessment]);
        setSelectedWorkerAssessment(mockAssessment);
        setActiveTab('assessment');
      } else {
        alert('Worker not found.');
      }
    }
  };

  // Help with breach
  const handleHelpWithBreach = (workerName: string) => {
    const subject = `Help Required - Skills & Experience Compliance Breach for ${workerName}`;
    const body = `Dear Complians Support Team,\n\nI need assistance with a skills & experience compliance breach for worker: ${workerName}\n\nPlease provide guidance on:\n- Immediate actions required for skills/experience issues\n- Remedial steps to ensure compliance\n- Documentation needed for Home Office\n- Sponsor licence protection measures\n\nThank you for your assistance.\n\nBest regards`;
    const mailtoLink = `mailto:support@complians.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (typeof window !== 'undefined') {
      window.open(mailtoLink);
    }
  };

  // Delete worker
  const handleDeleteWorker = (workerId: string) => {
    if (confirm('Are you sure you want to delete this worker?')) {
      const updatedWorkers = workers.filter(w => w.id !== workerId);
      setWorkers(updatedWorkers);
      if (typeof window !== 'undefined') {
        localStorage.setItem('skillsExperienceComplianceWorkers', JSON.stringify(updatedWorkers));
      }
      const updatedAssessments = assessments.filter(a => a.workerId !== workerId);
      setAssessments(updatedAssessments);
      if (typeof window !== 'undefined') {
        localStorage.setItem('skillsExperienceComplianceAssessments', JSON.stringify(updatedAssessments));
      }
    }
  };

  // Helper function to extract compliance status from narrative
  const extractComplianceStatus = (narrative: string): string => {
    if (narrative.includes('COMPLIANT')) return 'COMPLIANT';
    if (narrative.includes('SERIOUS BREACH')) return 'SERIOUS_BREACH';
    if (narrative.includes('MAJOR CONCERNS')) return 'MAJOR_CONCERNS';
    if (narrative.includes('MINOR ISSUES')) return 'MINOR_ISSUES';
    return 'REQUIRES_REVIEW';
  };

  // Fallback template generator
  const generateTemplateNarrative = (workerId: string): string => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker) return 'Worker not found';
    
    return `
SKILLS AND EXPERIENCE COMPLIANCE ASSESSMENT

Worker: ${worker.name}
Role: ${worker.jobTitle}
SOC Code: ${worker.socCode}
Assessment Date: ${new Date().toLocaleDateString()}

This is a template-generated report. AI service was unavailable.

Documents Reviewed:
${selectedFiles.map(f => `- ${f.name} (${f.type})`).join('\n')}

COMPLIANCE STATUS: REQUIRES MANUAL REVIEW

Note: This assessment requires manual review as the AI service was unavailable. 
Please review all documents manually to ensure compliance with Home Office requirements.
  `.trim();
  };

  // UI Components
  const TabButton = ({
    value,
    icon,
    label,
  }: {
    value: string;
    icon: React.ReactNode;
    label: string;
  }) => (
    <button
      className={`flex items-center gap-2 px-6 py-2 rounded-t-lg font-medium transition-colors ${
        activeTab === value
          ? 'bg-white text-brand-dark border-b-2 border-brand-dark'
          : 'bg-gray-100 text-gray-500'
      }`}
      onClick={() => setActiveTab(value)}
    >
      {icon}
      {label}
    </button>
  );

  // Get status badge function
  const getStatusBadge = (status: string, redFlag: boolean = false) => {
    if (redFlag) {
      return <Badge className="bg-red-500 text-white animate-pulse">SERIOUS BREACH</Badge>;
    }
    switch (status) {
      case 'COMPLIANT':
        return <Badge className="bg-green-500 text-white">COMPLIANT</Badge>;
      case 'SERIOUS_BREACH':
        return <Badge className="bg-red-500 text-white">SERIOUS BREACH</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get risk badge function
  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return <Badge className="bg-green-100 text-green-800">LOW</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-yellow-100 text-yellow-800">MEDIUM</Badge>;
      case 'HIGH':
        return <Badge className="bg-red-100 text-red-800">HIGH</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-dark mb-2 flex items-center gap-3">
            <Bot className="h-8 w-8 text-brand-light" />
            AI Skills & Experience Compliance System
          </h1>
          <p className="text-gray-600">
            AI-powered skills and experience compliance analysis for UK sponsors
          </p>
        </div>

        {/* Two-column layout above tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-lg p-6 shadow border">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left: What this agent does */}
              <div className="md:w-2/3 w-full mb-4 md:mb-0">
                <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-[#263976] mb-2">
                    What this agent does:
                  </h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    The AI Skills & Experience Compliance System is a sophisticated automated assessment tool designed to evaluate and verify the qualifications, skills, and professional experience of migrant workers against UK Home Office compliance requirements. This system ensures that all sponsored workers possess the necessary competencies and documented experience to fulfill their designated roles effectively and lawfully.
                  </p>
                  <ul className="list-disc list-inside mb-4 text-gray-700">
                    <li>Verifies skills and experience match the specific job role requirements</li>
                    <li>Analyses CVs, references, contracts, payslips, and training certificates</li>
                    <li>Detects inconsistencies and gaps in employment history and qualifications</li>
                    <li>Flags compliance risks under paragraph C1.38 of the Immigration Rules</li>
                    <li>Generates legal-style reports with detailed compliance assessments</li>
                    <li>Provides remedial action guidance for identified compliance gaps</li>
                  </ul>
                </div>
              </div>
              {/* Right: Documents required */}
              <div className="md:w-1/3 w-full">
                <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                  <h4 className="text-md font-semibold text-[#263976] mb-2">Documents required for a full compliance assessment:</h4>
                  <ul className="list-disc list-inside text-gray-700">
                    <li>Certificate of Sponsorship (CoS)</li>
                    <li>Full job description document</li>
                    <li>CV with detailed employment history</li>
                    <li>Reference letters from previous employers</li>
                    <li>Employment contracts and terms of engagement</li>
                    <li>Recent payslips demonstrating salary compliance</li>
                    <li>Training certificates and professional qualifications (if applicable)</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Warning */}
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-red-600 font-medium text-sm leading-relaxed">
                  ⚠️ CRITICAL COMPLIANCE WARNING: Missing or incomplete documentation will be marked against compliance and may result in a serious breach of sponsor duties or potential licence suspension. The AI Skills & Experience Compliance System provides essential verification but does not replace the sponsor's legal responsibility to ensure all workers meet the required standards.
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500">
          <TabButton
            value="dashboard"
            icon={<BarChart3 className="h-5 w-5" />}
            label="Dashboard"
          />
          <TabButton
            value="workers"
            icon={<Users className="h-5 w-5" />}
            label="Workers"
          />
          <TabButton
            value="assessment"
            icon={<FileText className="h-5 w-5" />}
            label="Assessment"
          />
          <TabButton
            value="ai-assistant"
            icon={<MessageSquare className="h-5 w-5" />}
            label="AI Assistant"
          />
        </div>
        </div>
        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg p-6 shadow border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500">
                      Total Workers
                    </div>
                    <div className="text-2xl font-bold text-brand-dark">
                      {dashboardStats.totalWorkers}
                    </div>
                    <div className="text-xs text-gray-400">Active workers</div>
                  </div>
                  <Users className="h-6 w-6 text-brand-light" />
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500">
                      Compliance Rate
                    </div>
                    <div className="text-2xl font-bold text-brand-dark">
                      {dashboardStats.complianceRate}%
                    </div>
                    <div className="text-xs text-gray-400">
                      {dashboardStats.compliantWorkers} compliant workers
                    </div>
                  </div>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <div
                className={`bg-white rounded-lg p-6 shadow border ${
                  dashboardStats.redFlags > 0
                    ? 'border-red-500 border-2 animate-pulse'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-red-500">
                      Red Flags
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                      {dashboardStats.redFlags}
                    </div>
                    <div className="text-xs text-red-600">
                      Immediate attention required
                    </div>
                  </div>
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500">
                      High Risk
                    </div>
                    <div className="text-2xl font-bold text-brand-dark">
                      {dashboardStats.highRisk}
                    </div>
                    <div className="text-xs text-gray-400">
                      High risk workers
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg p-6 shadow border">
                <div className="font-semibold text-brand-dark mb-2 flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Compliance Status Distribution
                </div>
                {/* Pie chart placeholder */}
                <div className="flex items-center justify-center h-48">
                  <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">[Pie Chart]</span>
                  </div>
                </div>
                <div className="flex justify-center space-x-4 mt-4">
                  {pieChartData.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm">
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow border">
                <div className="font-semibold text-brand-dark mb-2 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Risk Level Breakdown
                </div>
                <BarChartComponent data={barChartData} />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg p-6 shadow border">
              <div className="font-semibold text-brand-dark mb-2">
                Recent Activity
              </div>
              <ul>
                <li className="mb-2 text-sm">
                  <span className="text-yellow-500 font-bold">●</span> Ahmed Hassan requires review
                  <div className="text-xs text-gray-500">
                    Missing training certificates - 2024-06-08
                  </div>
                </li>
                <li className="mb-2 text-sm">
                  <span className="text-red-500 font-bold">●</span> Red flag detected for Sarah Johnson
                  <div className="text-xs text-gray-500">
                    Care Assistant without qualifications - 2024-06-09
                  </div>
                </li>
                <li className="mb-2 text-sm">
                  <span className="text-green-500 font-bold">●</span> John Smith assessment completed
                  <div className="text-xs text-gray-500">
                    Compliant status confirmed - 2024-06-10
                  </div>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'workers' && (
          <div className="bg-white rounded-lg p-6 shadow border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-brand-dark flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Workers
                </div>
                <div className="text-gray-600 text-sm mt-1">
                  Manage sponsored workers and their skills/experience
                </div>
              </div>
              <button className="bg-brand-light text-brand-dark px-4 py-2 rounded flex items-center gap-2 font-medium" aria-label="Add Worker">
                <Plus className="h-4 w-4" />
                Add Worker
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 text-brand-dark">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Job Title</th>
                    <th className="px-4 py-2 text-left">SOC Code</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Risk Level</th>
                    <th className="px-4 py-2 text-left">View Report</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((worker) => (
                    <tr
                      key={worker.id}
                      className={
                        worker.redFlag
                          ? 'bg-red-50'
                          : worker.complianceStatus === 'SERIOUS_BREACH'
                          ? 'bg-yellow-50'
                          : ''
                      }
                    >
                      <td className="px-4 py-2">{worker.name}</td>
                      <td className="px-4 py-2">{worker.jobTitle}</td>
                      <td className="px-4 py-2">{worker.socCode}</td>
                      <td className="px-4 py-2">
                        {getStatusBadge(worker.complianceStatus, worker.redFlag)}
                      </td>
                      <td className="px-4 py-2">
                        {getRiskBadge(worker.riskLevel)}
                      </td>
                      <td className="px-4 py-2">
                        <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => handleViewWorkerReport(worker.id)}>
                          <Eye className="h-4 w-4 mr-1" /> View Report
                        </Button>
                      </td>
                      <td className="px-4 py-2">
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteWorker(worker.id)}>
                          <XCircle className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'assessment' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow border">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Skills & Experience Documents</h3>
                <p className="text-gray-600 mb-4">Upload CV, qualification certificates, experience documents, and application forms for AI analysis</p>
                <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.doc" onChange={handleFileSelect} className="hidden" aria-label="Upload Skills & Experience Documents" />
                <Button className="bg-black hover:bg-gray-800 text-white mb-4" onClick={() => fileInputRef.current?.click()} aria-label="Choose Files">Choose Files</Button>
                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Selected Files ({selectedFiles.length}):</h4>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleClearAllFiles}
                        className="text-red-600 hover:text-red-700"
                      >
                        Clear All
                      </Button>
            </div>
                    <ul className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded hover:bg-gray-100 transition">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" /> 
                            <span className="truncate">{file.name}</span>
              </div>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleRemoveFile(index)}
                          className="ml-2"
              >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 space-y-2">
                    <Button className="bg-green-500 hover:bg-green-600 text-white w-full" onClick={handleAnalyze} disabled={uploading || selectedFiles.length === 0} aria-label="Analyze Skills & Experience">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Analyze Skills & Experience ({selectedFiles.length} files)
                    </Button>
                    <Button 
                      className="bg-black hover:bg-gray-800 text-white w-full" 
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Add More Files"
                    >
                      <Plus className="h-4 w-4 mr-2" /> 
                      Add More Files
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Assessment Results */}
          {(currentAssessment || selectedWorkerAssessment) && (
            <div className={`bg-white rounded-lg p-6 shadow border ${(currentAssessment?.redFlag || selectedWorkerAssessment?.redFlag) ? 'border-red-500 border-2' : ''}`}>
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-2">
                  <GraduationCap className="h-6 w-6 text-gray-600 mr-2" />
                  <h3 className="text-xl font-semibold text-brand-dark">Skills & Experience Compliance Analysis Report</h3>
                </div>
                <p className="text-sm text-gray-600">Generated on {new Date((currentAssessment || selectedWorkerAssessment)?.generatedAt || '').toLocaleDateString('en-GB')} {new Date((currentAssessment || selectedWorkerAssessment)?.generatedAt || '').toLocaleTimeString('en-GB', { hour12: false })}</p>
              </div>
              
              <div className="space-y-6">
                {/* Serious Breach Alert */}
                {(currentAssessment?.redFlag || selectedWorkerAssessment?.redFlag) && (
                  <div className="bg-red-500 text-white p-4 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-bold">SERIOUS SKILLS & EXPERIENCE BREACH DETECTED</span>
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <p>Skills and experience requirements not met - Immediate review required</p>
                  </div>
                )}
                
                {/* Professional Assessment */}
                <div className="border-l-4 border-blue-300 bg-blue-50 p-6">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                    {(currentAssessment || selectedWorkerAssessment)?.professionalAssessment || ''}
                  </div>
                </div>
                
                {/* Assessment Summary */}
                <div>
                  <h4 className="font-medium mb-3 text-brand-dark flex items-center gap-2">
                    <FileCheck className="h-4 w-4" /> Assessment Summary
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="text-gray-600 font-medium">Worker:</label>
                      <p>{(currentAssessment || selectedWorkerAssessment)?.workerName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 font-medium">Job Title:</label>
                      <p>{(currentAssessment || selectedWorkerAssessment)?.jobTitle || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 font-medium">SOC Code:</label>
                      <p>{(currentAssessment || selectedWorkerAssessment)?.socCode || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 font-medium">Skills:</label>
                      <p>{(currentAssessment || selectedWorkerAssessment)?.skills || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 font-medium">Experience:</label>
                      <p>{(currentAssessment || selectedWorkerAssessment)?.experience || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 font-medium">Status:</label>
                      <p>{((currentAssessment || selectedWorkerAssessment)?.complianceStatus || 'N/A').replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                </div>
                
                {/* Report Options */}
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4 text-brand-dark flex items-center gap-2">
                    <Download className="h-4 w-4" /> Report Options
                  </h4>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Email Address for Report:</label>
                    <input 
                      type="email" 
                      placeholder="Enter email address" 
                      className="w-full px-3 py-2 border rounded-lg" 
                      value={recipientEmail} 
                      onChange={(e) => setRecipientEmail(e.target.value)} 
                    />
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleDownloadPDF} aria-label="Download PDF">
                      <Download className="h-4 w-4 mr-2" /> Download PDF
                    </Button>
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={handleEmailReport} aria-label="Email Report">
                      <Mail className="h-4 w-4 mr-2" /> Email Report
                    </Button>
                    <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={handlePrintReport} aria-label="Print Report">
                      <Printer className="h-4 w-4 mr-2" /> Print Report
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'ai-assistant' && (
        <div className="bg-white rounded-lg p-6 shadow border">
          <div className="font-semibold text-brand-dark flex items-center gap-2 mb-4">
            <Bot className="h-5 w-5" />
            AI Compliance Assistant
          </div>
          <div className="bg-gray-50 rounded-lg p-6 min-h-[200px] mb-4">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-2 ${
                  msg.role === 'assistant'
                    ? 'text-left'
                    : 'text-right text-blue-700'
                }`}
              >
                <div className="inline-block bg-white rounded-lg px-4 py-2 shadow text-sm">
                  {msg.content}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {msg.timestamp}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="flex-1 border rounded px-3 py-2"
              placeholder="Type your message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleChatSend();
              }}
            />
            <button
              className="bg-brand-light text-brand-dark px-4 py-2 rounded flex items-center gap-2 font-medium"
              onClick={handleChatSend}
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
        </div>
      )}
      <Dialog open={!!previewDocument} onOpenChange={() => setPreviewDocument(null)}>
        <DialogContent className="max-w-6xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          {previewDocument && (
            <DocumentPreview 
              file={previewDocument}
              extractedData={extractedData}
              onClose={() => setPreviewDocument(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Worker Information Form */}
      <Dialog open={showWorkerForm} onOpenChange={setShowWorkerForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Worker Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Worker Name *</label>
              <input
                type="text"
                value={pendingWorkerData?.workerName || ''}
                onChange={(e) => setPendingWorkerData({...pendingWorkerData, workerName: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter worker's full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Job Title (as stated in the CoS) *</label>
              <input
                type="text"
                value={pendingWorkerData?.jobTitle || ''}
                onChange={(e) => setPendingWorkerData({...pendingWorkerData, jobTitle: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Software Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SOC Code *</label>
              <input
                type="text"
                value={pendingWorkerData?.socCode || ''}
                onChange={(e) => setPendingWorkerData({...pendingWorkerData, socCode: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 2136"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Assignment Date</label>
              <input
                type="date"
                value={pendingWorkerData?.assignmentDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => setPendingWorkerData({...pendingWorkerData, assignmentDate: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowWorkerForm(false);
                  setPendingWorkerData(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (pendingWorkerData?.workerName && pendingWorkerData?.jobTitle && pendingWorkerData?.socCode) {
                    setShowWorkerForm(false);
                    // Continue with assessment generation
                    await generateAssessmentWithData(pendingWorkerData);
                  } else {
                    toast.error('Please fill in all required fields');
                  }
                }}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 