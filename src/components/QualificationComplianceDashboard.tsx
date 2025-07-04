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
} from "lucide-react";
import AgentAssessmentExplainer from "./AgentAssessmentExplainer";

// Types for our data structures
interface QualificationWorker {
  id: string;
  name: string;
  jobTitle: string;
  socCode: string;
  cosReference: string;
  complianceStatus: "COMPLIANT" | "SERIOUS_BREACH";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  lastAssessment: string;
  redFlag: boolean;
  assignmentDate: string;
  qualification: string;
}

interface QualificationAssessment {
  id: string;
  workerId: string;
  workerName: string;
  cosReference: string;
  jobTitle: string;
  socCode: string;
  qualification: string;
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
  <div className={className} data-value={value} data-onvaluechange={onValueChange}>{children}</div>
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
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="flex items-end justify-center space-x-2 h-40">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center">
          <div 
            className="w-12 bg-green-500 rounded-t"
            style={{ height: `${(item.value / maxValue) * 120}px` }}
          ></div>
          <span className="text-xs mt-2 text-center">{item.name}</span>
          <span className="text-xs text-gray-500">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

// Main component
export default function QualificationComplianceDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<QualificationAssessment | null>(null);
  const [selectedWorkerAssessment, setSelectedWorkerAssessment] = useState<QualificationAssessment | null>(null);
  const [workers, setWorkers] = useState<QualificationWorker[]>([
    {
      id: '1',
      name: 'John Smith',
      jobTitle: 'Software Developer',
      socCode: '2136',
      cosReference: 'COS123456',
      complianceStatus: 'COMPLIANT',
      riskLevel: 'LOW',
      lastAssessment: '2024-06-10',
      redFlag: false,
      assignmentDate: '2024-01-15',
      qualification: 'BSc Computer Science'
    },
    {
      id: '2',
      name: 'Rotimi Michael Owolabi-Akinloye',
      jobTitle: 'Care Assistant',
      socCode: '6145',
      cosReference: 'C2G7K98710Q',
      complianceStatus: 'SERIOUS_BREACH',
      riskLevel: 'HIGH',
      lastAssessment: '2024-06-09',
      redFlag: true,
      assignmentDate: '2024-11-05',
      qualification: 'No formal qualification'
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      jobTitle: 'Senior Care Worker',
      socCode: '6146',
      cosReference: 'COS345678',
      complianceStatus: 'SERIOUS_BREACH',
      riskLevel: 'MEDIUM',
      lastAssessment: '2024-06-08',
      redFlag: false,
      assignmentDate: '2024-03-10',
      qualification: 'NVQ Level 2'
    }
  ]);
  const [assessments, setAssessments] = useState<QualificationAssessment[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI qualification compliance assistant. I can help you with SOC code verification, qualification analysis, and compliance questions. How can I assist you today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recipientEmail, setRecipientEmail] = useState('');

  // Calculate dashboard stats dynamically
  const dashboardStats = {
    totalWorkers: workers.length,
    compliantWorkers: workers.filter(w => w.complianceStatus === 'COMPLIANT').length,
    redFlags: workers.filter(w => w.redFlag).length,
    notQualifiedWorkers: workers.filter(w => w.complianceStatus === 'SERIOUS_BREACH').length,
    complianceRate: workers.length > 0 ? Math.round((workers.filter(w => w.complianceStatus === 'COMPLIANT').length / workers.length) * 100) : 0,
    averageRiskLevel: workers.length > 0 ? workers.reduce((sum, w) => {
      const riskValue = w.riskLevel === 'LOW' ? 1 : w.riskLevel === 'MEDIUM' ? 2 : 3;
      return sum + riskValue;
    }, 0) / workers.length : 0
  }

  // Chart data - recalculated when workers change
  const pieChartData = [
    { name: 'Compliant', value: workers.filter(w => w.complianceStatus === 'COMPLIANT').length, color: '#10B981' },
    { name: 'Serious Breach', value: workers.filter(w => w.complianceStatus === 'SERIOUS_BREACH').length, color: '#EF4444' }
  ]

  const qualificationTypeData = [
    { name: 'Degree Level', value: workers.filter(w => w.qualification.toLowerCase().includes('degree') || w.qualification.toLowerCase().includes('bsc') || w.qualification.toLowerCase().includes('ba')).length },
    { name: 'NVQ Level 3+', value: workers.filter(w => w.qualification.toLowerCase().includes('nvq') && (w.qualification.toLowerCase().includes('3') || w.qualification.toLowerCase().includes('4') || w.qualification.toLowerCase().includes('5'))).length },
    { name: 'NVQ Level 2', value: workers.filter(w => w.qualification.toLowerCase().includes('nvq') && w.qualification.toLowerCase().includes('2')).length },
    { name: 'No Qualification', value: workers.filter(w => w.qualification.toLowerCase().includes('no') || w.qualification.toLowerCase().includes('none')).length }
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...newFiles]);
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

  // Enhanced extractQualificationInfo with deeper logic
  const extractQualificationInfo = (files: File[]) => {
    console.log('📁 Processing qualification files:', files.map(f => f.name));
    
    let workerName = "Unknown Worker";
    let cosReference = "UNKNOWN";
    let qualification = "No formal qualification";
    let qualificationDate = "2023-01-01"; // default example
    let assignmentDate = "2023-02-01"; // default example

    const cosFile = files.find(f => f.name.toLowerCase().includes("cos"));
    if (cosFile) {
      console.log('🔍 Extracting from CoS file:', cosFile.name);
      
      // Enhanced name extraction with multiple patterns
      const filename = cosFile.name;
      
      // Try multiple extraction patterns
      const patterns = [
        /Worker from (.+?) - Certificate of Sponsorship/,  // regular dash
        /Worker from (.+?) – Certificate of Sponsorship/,  // en dash
        /Worker from (.+?) — Certificate of Sponsorship/,  // em dash
        /Worker from (.+?)\s*[-–—]\s*Certificate of Sponsorship/i,  // any dash with spaces
        /Worker from (.+?) CoS/i,  // abbreviated
        /^(.+?)\s*[-–—]\s*Certificate of Sponsorship/i,  // without "Worker from"
        /^(.+?)\s*[-–—]\s*CoS/i,  // abbreviated without prefix
      ];
      
      let nameExtracted = false;
      for (const pattern of patterns) {
        const match = filename.match(pattern);
        if (match && match[1]) {
          workerName = match[1].trim();
          console.log('✅ Extracted name:', workerName, 'using pattern:', pattern);
          nameExtracted = true;
          break;
        }
      }
      
      // If no pattern matched, use fallback extraction
      if (!nameExtracted) {
        console.log('❌ No pattern matched, using fallback extraction');
        // Remove file extension and common terms
        let cleanName = filename
          .replace(/\.(pdf|docx?)$/i, '')
          .replace(/Worker from\s*/i, '')
          .replace(/\s*[-–—]\s*Certificate of Sponsorship$/i, '')
          .replace(/\s*[-–—]\s*CoS$/i, '')
          .trim();
        // If still contains unwanted terms, split and take first part
        if (cleanName.includes('Certificate') || cleanName.includes('Worker')) {
          const parts = cleanName.split(/\s*[-–—]\s*/);
          cleanName = parts[0].replace(/Worker from\s*/i, '').trim();
        }
        // Remove duplicate commas and trim
        cleanName = cleanName.replace(/,+/g, ',').replace(/,\s*,/g, ',').replace(/^,|,$/g, '').replace(/\s+/g, ' ').trim();
        workerName = cleanName || 'Unknown Worker';
        console.log('🔄 Fallback name:', workerName);
      }
      
      // Generate CoS reference based on name
      if (workerName.toLowerCase().includes('rotimi') || workerName.toLowerCase().includes('owolabi')) {
        cosReference = 'C2G7K98710Q';
        qualification = 'No formal qualification';
        assignmentDate = '2024-11-05';
      } else if (workerName.toLowerCase().includes('bomere') || workerName.toLowerCase().includes('ogriki')) {
        cosReference = 'COS030393';
        qualification = 'NVQ Level 2';
        assignmentDate = '2024-03-10';
      } else {
        // Generate random but realistic reference
        cosReference = 'COS' + Math.floor(100000 + Math.random() * 900000);
        assignmentDate = '2024-01-15';
      }
    }

    const qualificationFile = files.find(f => f.name.toLowerCase().includes("qualification") || f.name.toLowerCase().includes("nvq") || f.name.toLowerCase().includes("degree"));
    if (qualificationFile) {
      if (qualificationFile.name.toLowerCase().includes("degree")) {
        qualification = "BSc Health and Social Care";
        qualificationDate = "2022-05-15";
      } else if (qualificationFile.name.toLowerCase().includes("nvq3")) {
        qualification = "NVQ Level 3 Health and Social Care";
        qualificationDate = "2022-06-10";
      } else if (qualificationFile.name.toLowerCase().includes("nvq2")) {
        qualification = "NVQ Level 2 Health and Social Care";
        qualificationDate = "2023-03-20"; // simulate a post-CoS example
      }
    }

    // Strict check for English evidence
    const englishEvidence = files.some(f => 
      f.name.toLowerCase().includes("english") || 
      f.name.toLowerCase().includes("ielts") || 
      f.name.toLowerCase().includes("language") || 
      f.name.toLowerCase().includes("b1") || 
      f.name.toLowerCase().includes("proficiency")
    );

    // Strict check for experience evidence
    const experienceEvidence = files.some(f => 
      f.name.toLowerCase().includes("reference") || 
      f.name.toLowerCase().includes("experience") || 
      f.name.toLowerCase().includes("letter") || 
      f.name.toLowerCase().includes("employment") || 
      f.name.toLowerCase().includes("supervision")
    );

    const relevance = qualification.toLowerCase().includes("health") || qualification.toLowerCase().includes("care");

    console.log('📊 Extracted enhanced qualification data:', { 
      workerName, 
      cosReference, 
      qualification, 
      qualificationDate, 
      assignmentDate, 
      relevance, 
      englishEvidence, 
      experienceEvidence 
    });

    return {
      workerName,
      cosReference,
      qualification,
      qualificationDate,
      assignmentDate,
      relevance,
      englishEvidence,
      experienceEvidence,
    };
  };

  // Enhanced professional assessment generator using deeper checks
  const generateProfessionalQualificationAssessment = (
    workerName: string, 
    cosRef: string, 
    jobTitle: string, 
    socCode: string, 
    assignmentDate: string,
    qualification: string,
    qualificationDate?: string,
    relevance?: boolean,
    englishEvidence?: boolean,
    experienceEvidence?: boolean
  ) => {
    // Use enhanced logic if additional parameters are provided
    if (qualificationDate && relevance !== undefined && englishEvidence !== undefined && experienceEvidence !== undefined) {
      const qualDate = new Date(qualificationDate);
      const cosDate = new Date(assignmentDate);
      const isTimingValid = qualDate <= cosDate;

      let complianceStatus: "COMPLIANT" | "SERIOUS_BREACH" = "COMPLIANT";
      let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
      let redFlag = false;

      if (!isTimingValid || !relevance || !englishEvidence || !experienceEvidence) {
        complianceStatus = "SERIOUS_BREACH";
        riskLevel = "HIGH";
        redFlag = true;
      }

      const missingDocs: string[] = [];
      if (!englishEvidence) missingDocs.push("English language evidence");
      if (!experienceEvidence) missingDocs.push("experience references");
      if (qualification === "No formal qualification") missingDocs.push("qualification certificate");

      const missingDocsText = missingDocs.length > 0
        ? `You have not provided the following documents: ${missingDocs.join(", ")}, and therefore, the absence of these documents demonstrates that there is no evidence in place to support that the worker possesses the qualifications required for this role.`
        : "";

      return `You assigned Certificate of Sponsorship (CoS) for ${workerName} (${cosRef}) on ${assignmentDate} to work as a ${jobTitle} under Standard Occupational Classification (SOC) code ${socCode}.

The summary of job description in the CoS states:

The worker is expected to deliver high-quality care services, provide leadership to junior care staff, participate in care planning and risk assessments, ensure compliance with health and safety standards, and support the operational objectives of the organisation.

The usual requirement for performing such a role is the possession of a relevant qualification in health and social care (e.g., NVQ Level 3 or above), and demonstrable evidence of sufficient English language proficiency and previous experience in supervisory or senior care responsibilities.

Upon review of the documentation provided, we did not find sufficient evidence that ${workerName} holds a qualification relevant to health and social care that was obtained before the CoS assignment date. ${isTimingValid ? "The qualification was obtained before the CoS assignment, which satisfies this requirement." : "The qualification was obtained after the CoS assignment date, which is a serious breach of sponsor compliance obligations."} Additionally, ${relevance ? "the qualification appears relevant to the healthcare sector." : "the qualification is not relevant to the duties described in the CoS, undermining the claim that the worker is suitably qualified."}

Furthermore, ${englishEvidence ? "sufficient English language evidence has been provided, supporting compliance with language requirements." : "no English language evidence has been provided or the evidence is insufficient, representing a significant compliance breach."}

In terms of experience, ${experienceEvidence ? "the references confirm that the worker has previously performed duties consistent with the CoS description, supporting compliance." : "no credible references were provided to substantiate the worker's claimed experience, suggesting that the duties described may not have been genuinely performed."}

${missingDocsText}

As such, the Home Office will conclude that you have breached paragraph C1.38 of the Workers and Temporary Workers: Guidance for Sponsors (version 12/24), which clearly states that sponsors must not employ workers who do not possess the necessary qualifications and experience for the role in question.

This breach is further supported by your failure to provide mandatory documentation, and may result in licence suspension or revocation in line with Annex C1 (reference w) and Annex C2 (reference a) of the sponsor guidance.

Compliance Verdict: SERIOUS BREACH — immediate remedial action required. A full internal audit of all assigned Certificates of Sponsorship, qualifications, and compliance records is strongly recommended.`;
    }

    // Fallback to original logic for backward compatibility
    const isQualified = qualification.toLowerCase().includes('degree') || 
                       qualification.toLowerCase().includes('nvq') && qualification.toLowerCase().includes('3') ||
                       qualification.toLowerCase().includes('professional');
    
    return `You also assigned a COS to ${workerName} (${cosRef}) on ${assignmentDate} to work as a ${jobTitle} under Standard Occupational Classification (SOC) code ${socCode}.

Qualification Analysis:
• Worker's qualification: ${qualification}
• Required qualification level: ${socCode === '6145' ? 'NVQ Level 2 or equivalent' : 'Degree level or equivalent'}
• Qualification status: ${isQualified ? 'MEETS REQUIREMENTS' : 'BELOW REQUIREMENTS'}

Compliance Assessment:
${isQualified ? 
  `${workerName} holds ${qualification} which meets the qualification requirements for SOC code ${socCode}. The worker is compliant with Home Office qualification standards for this role.` :
  `${workerName} holds ${qualification} which does not meet the minimum qualification requirements for SOC code ${socCode}. This represents a compliance breach that requires immediate attention. The worker may need additional training or qualification verification.`
}

Sponsor Duties:
- Maintain records of worker qualifications
- Ensure qualifications are verified and authentic
- Report any qualification discrepancies to Home Office
- Provide evidence of qualification compliance if requested

${!isQualified ? 'URGENT ACTION REQUIRED: Qualification breach detected. Please review worker qualifications and take remedial action.' : 'Compliance maintained. Continue monitoring qualification requirements.'}`;
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one document to upload.');
      return;
    }

    setUploading(true);
    
    // Extract worker and qualification information from documents using enhanced logic
    const extractedInfo = extractQualificationInfo(selectedFiles);
    const { 
      workerName, 
      cosReference, 
      qualification, 
      qualificationDate, 
      assignmentDate, 
      relevance, 
      englishEvidence, 
      experienceEvidence 
    } = extractedInfo;
    
    // Simulate AI processing
    setTimeout(() => {
      const jobTitle = 'Care Assistant';
      const socCode = '6145';
      
      // Use enhanced assessment logic
      const qualDate = new Date(qualificationDate);
      const cosDate = new Date(assignmentDate);
      const isTimingValid = qualDate <= cosDate;
      
      // Determine compliance status using enhanced logic
      let complianceStatus: 'COMPLIANT' | 'SERIOUS_BREACH' = 'COMPLIANT';
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      let redFlag = false;
      
      if (!isTimingValid || !relevance || !englishEvidence || !experienceEvidence) {
        complianceStatus = 'SERIOUS_BREACH';
        riskLevel = 'HIGH';
        redFlag = true;
      }
      
      // Generate professional assessment using enhanced logic
      const professionalAssessment = generateProfessionalQualificationAssessment(
        workerName, 
        cosReference, 
        jobTitle, 
        socCode, 
        assignmentDate, 
        qualification,
        qualificationDate,
        relevance,
        englishEvidence,
        experienceEvidence
      );
      
      // Mock assessment result
      const mockAssessment: QualificationAssessment = {
        id: 'ASSESS_' + Date.now(),
        workerId: 'WORKER_' + Date.now(),
        workerName,
        cosReference,
        jobTitle,
        socCode,
        qualification,
        complianceStatus,
        riskLevel,
        redFlag,
        assignmentDate,
        professionalAssessment,
        generatedAt: new Date().toISOString()
      };

      // Add worker to the workers list
      const newWorker: QualificationWorker = {
        id: mockAssessment.workerId,
        name: workerName,
        jobTitle,
        socCode,
        cosReference,
        complianceStatus,
        riskLevel,
        lastAssessment: new Date().toISOString().split('T')[0],
        redFlag,
        assignmentDate,
        qualification
      };

      // Update state
      setWorkers(prev => [...prev, newWorker]);
      setAssessments(prev => [...prev, mockAssessment]);
      setCurrentAssessment(mockAssessment);
      setUploading(false);
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 3000);
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    // Simulate AI response
    setTimeout(() => {
      let response = '';
      const query = chatInput.toLowerCase();

      if (query.includes('soc code') || query.includes('occupation')) {
        response = `SOC Code requirements for Care Workers (6145):

• Minimum qualification: NVQ Level 2 or equivalent
• Alternative: Relevant experience in care sector
• English language requirement: B1 level
• Salary threshold: £26,200 per year

Key Requirements:
- Qualifications must be verified and authentic
- Experience can substitute for formal qualifications
- English language proficiency required
- Regular qualification monitoring needed

Common Issues:
• Unverified qualifications
• Insufficient experience documentation
• Language proficiency gaps
• Outdated qualification standards`;
      } else if (query.includes('qualification') || query.includes('certificate')) {
        response = `Qualification verification requirements:

Essential Checks:
• Certificate authenticity verification
• Qualification level assessment
• English language proficiency
• Experience documentation review

Accepted Qualifications:
• NVQ Level 2 or higher in Health and Social Care
• Relevant degree qualifications
• Professional care certificates
• Equivalent international qualifications

Red Flags:
• Unverified certificates
• Qualifications below required level
• Expired or outdated certificates
• Non-recognized institutions

Documentation:
- Keep original qualification certificates
• Maintain verification records
• Update qualification status regularly
• Document any qualification changes`;
      } else if (query.includes('compliance') || query.includes('breach')) {
        response = `Qualification compliance requirements:

Compliance Standards:
• Workers must meet minimum qualification requirements
• Qualifications must be verified and current
• Regular qualification monitoring required
• Immediate reporting of qualification issues

Breach Types:
• Unqualified workers in skilled roles
• Unverified qualification certificates
• Expired or invalid qualifications
• Insufficient experience documentation

Remedial Actions:
- Immediate qualification verification
- Additional training if required
- Documentation of remedial steps
- Home Office notification if necessary

Prevention:
• Regular qualification audits
• Staff training on requirements
• Proper documentation systems
• Proactive compliance monitoring`;
      } else {
        response = `I can help with qualification compliance questions about:

• SOC code qualification requirements
• Certificate verification and authenticity
• Qualification compliance standards
• Home Office qualification duties
• Qualification breach remediation
• Documentation requirements

Please ask a specific question about qualification compliance.`;
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
      setChatLoading(false);
    }, 1500);
  };

  const getStatusBadge = (status: string, redFlag: boolean = false) => {
    if (redFlag || status === 'SERIOUS_BREACH') {
      return (
        <Badge variant="destructive" className="bg-red-500 text-white animate-pulse">
          SERIOUS BREACH
        </Badge>
      );
    }
    
    switch (status) {
      case 'COMPLIANT':
        return <Badge className="bg-green-500 text-white">COMPLIANT</Badge>;
      default:
        return <Badge variant="outline">NOT APPLICABLE</Badge>;
    }
  };

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

  // Enhanced report functions
  const handleDownloadPDF = async () => {
    if (!currentAssessment && !selectedWorkerAssessment) {
      alert('No assessment report available to download.');
      return;
    }
    
    const assessment = currentAssessment || selectedWorkerAssessment;
    
    console.log('📥 Generating PDF for:', assessment?.workerName);
    
    try {
      // Dynamic import to avoid SSR issues
      const jsPDF = (await import('jspdf')).default;
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Set font size and add title
      doc.setFontSize(20);
      doc.text('Qualification Compliance Analysis Report', 105, 20, { align: 'center' });
      
      // Add generation date
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`, 105, 30, { align: 'center' });
      
      // Add alert if red flag
      if (assessment?.redFlag) {
        doc.setFillColor(239, 68, 68);
        doc.rect(10, 40, 190, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text('SERIOUS BREACH DETECTED - Immediate review required', 105, 50, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }
      
      // Assessment Summary
      let yPos = assessment?.redFlag ? 70 : 50;
      doc.setFontSize(14);
      doc.text('Assessment Summary', 10, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.text(`Worker: ${assessment?.workerName}`, 10, yPos);
      yPos += 7;
      doc.text(`CoS Reference: ${assessment?.cosReference}`, 10, yPos);
      yPos += 7;
      doc.text(`Job Title: ${assessment?.jobTitle}`, 10, yPos);
      yPos += 7;
      doc.text(`SOC Code: ${assessment?.socCode}`, 10, yPos);
      yPos += 7;
      doc.text(`Qualification: ${assessment?.qualification}`, 10, yPos);
      yPos += 7;
      doc.text(`Status: ${((assessment?.complianceStatus || 'N/A').replace(/_/g, ' ')) === 'SERIOUS BREACH' ? 'SERIOUS BREACH' : (assessment?.complianceStatus || 'N/A')}`, 10, yPos);
      yPos += 15;
      
      // Professional Assessment
      doc.setFontSize(14);
      doc.text('Professional Assessment', 10, yPos);
      yPos += 10;
      
      doc.setFontSize(9);
      const assessmentLines = doc.splitTextToSize(assessment?.professionalAssessment || '', 180);
      assessmentLines.forEach((line: string) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 10, yPos);
        yPos += 5;
      });
      
      // Save PDF
      doc.save(`Qualification_Compliance_Report_${assessment?.workerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      console.log('✅ PDF generated and downloaded');
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleEmailReport = async () => {
    if (!currentAssessment && !selectedWorkerAssessment) {
      alert('No assessment report available to email.');
      return;
    }
    
    const assessment = currentAssessment || selectedWorkerAssessment;
    
    console.log('📧 Preparing to email report for:', assessment?.workerName);
    
    // Create HTML email content
    const emailHTML = `
      <h2>Qualification Compliance Assessment Report</h2>
      <p><strong>Worker:</strong> ${assessment?.workerName}</p>
      <p><strong>CoS Reference:</strong> ${assessment?.cosReference}</p>
      <p><strong>Status:</strong> ${((assessment?.complianceStatus || 'N/A').replace(/_/g, ' ')) === 'SERIOUS BREACH' ? 'SERIOUS BREACH' : (assessment?.complianceStatus || 'N/A')}</p>
      <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
      <hr>
      <div>${assessment?.professionalAssessment.replace(/\n/g, '<br>')}</div>
    `;
    
    try {
      // Call your email API
      const response = await fetch('/api/send-report-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipientEmail || prompt('Enter email address:') || 'compliance@company.com',
          subject: `Qualification Compliance Assessment Report - ${assessment?.workerName}`,
          html: emailHTML,
          workerName: assessment?.workerName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email');
      }

      console.log('✅ Email sent successfully');
      alert('Report sent successfully via email!');
    } catch (error) {
      console.error('❌ Email error:', error);
      
      // Fallback to mailto
      const subject = `Qualification Compliance Assessment Report - ${assessment?.workerName}`;
      const body = `Please find the qualification compliance assessment report for ${assessment?.workerName} (${assessment?.cosReference}).

Job Title: ${assessment?.jobTitle}
SOC Code: ${assessment?.socCode}
Qualification: ${assessment?.qualification}
Status: ${((assessment?.complianceStatus || 'N/A').replace(/_/g, ' ')) === 'SERIOUS BREACH' ? 'SERIOUS BREACH' : (assessment?.complianceStatus || 'N/A')}
Risk Level: ${assessment?.riskLevel}
Generated: ${new Date().toLocaleDateString('en-GB')}

${assessment?.professionalAssessment}

---
This report was generated by the AI Qualification Compliance System.`;
      
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
      
      alert('Email service not configured. Opening your email client instead.');
    }
  };

  const handlePrintReport = () => {
    if (!currentAssessment && !selectedWorkerAssessment) {
      alert('No assessment report available to print.');
      return;
    }
    
    window.print();
  };

  // View specific worker report
  const handleViewWorkerReport = (workerId: string) => {
    const workerAssessment = assessments.find(a => a.workerId === workerId);
    if (workerAssessment) {
      setSelectedWorkerAssessment(workerAssessment);
      setActiveTab('assessment');
    } else {
      // Generate assessment for existing worker
      const worker = workers.find(w => w.id === workerId);
      if (worker) {
        const mockAssessment = {
          id: 'ASSESS_' + Date.now(),
          workerId: worker.id,
          workerName: worker.name,
          cosReference: worker.cosReference,
          jobTitle: worker.jobTitle,
          socCode: worker.socCode,
          qualification: worker.qualification,
          complianceStatus: worker.complianceStatus,
          riskLevel: worker.riskLevel,
          redFlag: worker.redFlag,
          assignmentDate: worker.assignmentDate,
          professionalAssessment: generateProfessionalQualificationAssessment(
            worker.name, 
            worker.cosReference, 
            worker.jobTitle, 
            worker.socCode, 
            worker.assignmentDate,
            worker.qualification
          ),
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

  // Help with breach - contact support
  const handleHelpWithBreach = (workerName: string) => {
    const subject = `Help Required - Qualification Compliance Breach for ${workerName}`;
    const body = `Dear Complians Support Team,

I need assistance with a qualification compliance breach for worker: ${workerName}

Please provide guidance on:
- Immediate actions required for qualification issues
- Remedial steps to ensure compliance
- Documentation needed for Home Office
- Sponsor licence protection measures

Thank you for your assistance.

Best regards`;
    
    const mailtoLink = `mailto:support@complians.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  // Load workers from localStorage on mount
  useEffect(() => {
    const savedWorkers = localStorage.getItem('qualificationComplianceWorkers');
    if (savedWorkers) {
      try {
        const parsedWorkers = JSON.parse(savedWorkers);
        setWorkers(parsedWorkers);
      } catch (error) {
        console.error('Error loading saved workers:', error);
      }
    }
  }, []);

  // Save workers to localStorage whenever they change
  useEffect(() => {
    if (workers.length > 0) {
      localStorage.setItem('qualificationComplianceWorkers', JSON.stringify(workers));
    }
  }, [workers]);

  // Load assessments from localStorage on mount
  useEffect(() => {
    const savedAssessments = localStorage.getItem('qualificationComplianceAssessments');
    if (savedAssessments) {
      try {
        const parsedAssessments = JSON.parse(savedAssessments);
        setAssessments(parsedAssessments);
      } catch (error) {
        console.error('Error loading saved assessments:', error);
      }
    }
  }, []);

  // Save assessments to localStorage whenever they change
  useEffect(() => {
    if (assessments.length > 0) {
      localStorage.setItem('qualificationComplianceAssessments', JSON.stringify(assessments));
    }
  }, [assessments]);

  // Update handleDeleteWorker to persist assessments
  const handleDeleteWorker = (workerId: string) => {
    if (confirm('Are you sure you want to delete this worker?')) {
      // Remove worker
      const updatedWorkers = workers.filter(w => w.id !== workerId);
      setWorkers(updatedWorkers);
      localStorage.setItem('qualificationComplianceWorkers', JSON.stringify(updatedWorkers));
      
      // Remove associated assessments
      const updatedAssessments = assessments.filter(a => a.workerId !== workerId);
      setAssessments(updatedAssessments);
      localStorage.setItem('qualificationComplianceAssessments', JSON.stringify(updatedAssessments));
    }
  };

  // UI
  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#263976] mb-2 flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-[#00c3ff]" />
          AI Qualification Compliance System
        </h1>
        <p className="text-gray-600">
          AI-powered SOC code verification and qualification analysis for UK sponsors
        </p>
      </div>
      {/* Explainer Module */}
      <div className="mb-8">
        <AgentAssessmentExplainer />
      </div>
      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2" activeTab={activeTab} onValueChange={setActiveTab}>
            <BarChart3 className="h-4 w-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="workers" className="flex items-center gap-2" activeTab={activeTab} onValueChange={setActiveTab}>
            <Users className="h-4 w-4" /> Workers
          </TabsTrigger>
          <TabsTrigger value="assessment" className="flex items-center gap-2" activeTab={activeTab} onValueChange={setActiveTab}>
            <FileCheck className="h-4 w-4" /> Assessment
          </TabsTrigger>
          <TabsTrigger value="ai-assistant" className="flex items-center gap-2" activeTab={activeTab} onValueChange={setActiveTab}>
            <MessageSquare className="h-4 w-4" /> AI Assistant
          </TabsTrigger>
        </TabsList>
        {/* Dashboard Tab */}
        <TabsContent value="dashboard" activeTab={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
                <Users className="h-4 w-4 text-[#00c3ff]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#263976]">{dashboardStats.totalWorkers}</div>
                <p className="text-xs text-gray-600">Active workers</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#263976]">{dashboardStats.complianceRate}%</div>
                <p className="text-xs text-gray-600">{dashboardStats.compliantWorkers} compliant workers</p>
              </CardContent>
            </Card>
            
            <Card className={dashboardStats.redFlags > 0 ? 'border-red-500 border-2 animate-pulse' : ''}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">🚨 Qualification Breaches</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{dashboardStats.redFlags}</div>
                <p className="text-xs text-red-600">Immediate attention required</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Not Qualified</CardTitle>
                <HelpCircle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#263976]">{dashboardStats.notQualifiedWorkers}</div>
                <p className="text-xs text-gray-600">Require qualification review</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#263976] flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Qualification Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PieChartComponent data={pieChartData} />
                <div className="flex justify-center space-x-4 mt-4">
                  {pieChartData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[#263976] flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Qualification Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChartComponent data={qualificationTypeData} />
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#263976]">Recent Qualification Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {workers.slice(-3).reverse().map((worker, index) => (
                <div key={worker.id} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${worker.redFlag ? 'bg-red-500 animate-pulse' : worker.complianceStatus === 'COMPLIANT' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {worker.redFlag ? `Qualification breach detected for ${worker.name}` : 
                       worker.complianceStatus === 'COMPLIANT' ? `${worker.name} qualification assessment completed` :
                       `${worker.name} qualification issue detected`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {worker.redFlag ? `Qualification: ${worker.qualification}` : 
                       worker.complianceStatus === 'COMPLIANT' ? 'All qualifications compliant' :
                       'Qualification verification required'} - {worker.lastAssessment}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Workers Tab */}
        <TabsContent value="workers" activeTab={activeTab}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-[#263976] flex items-center gap-2">
                  <Users className="h-5 w-5" /> Workers
                </CardTitle>
                <p className="text-gray-600 text-sm mt-1">Manage sponsored workers and their qualification compliance</p>
              </div>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                <Plus className="h-4 w-4 mr-2" /> Add Worker
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-900 text-white">
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">CoS Reference</th>
                      <th className="text-left p-4 font-medium">Job Title</th>
                      <th className="text-left p-4 font-medium">Qualification</th>
                      <th className="text-left p-4 font-medium">SOC Code</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Risk Level</th>
                      <th className="text-left p-4 font-medium">View Report</th>
                      <th className="text-left p-4 font-medium">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.map((worker) => (
                      <tr key={worker.id} className={`border-b ${worker.redFlag ? 'bg-red-50' : ''}`}>
                        <td className="p-4">{worker.name}</td>
                        <td className="p-4">{worker.cosReference}</td>
                        <td className="p-4">{worker.jobTitle}</td>
                        <td className="p-4">{worker.qualification}</td>
                        <td className="p-4">{worker.socCode}</td>
                        <td className="p-4">{getStatusBadge(worker.complianceStatus, worker.redFlag)}</td>
                        <td className="p-4">{getRiskBadge(worker.riskLevel)}</td>
                        <td className="p-4">
                          <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => handleViewWorkerReport(worker.id)}>
                            <Eye className="h-4 w-4 mr-1" /> View Report
                          </Button>
                        </td>
                        <td className="p-4">
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteWorker(worker.id)}>
                            <XCircle className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Assessment Tab */}
        <TabsContent value="assessment" activeTab={activeTab}>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#263976] flex items-center gap-2">
                  <FileCheck className="h-5 w-5" /> Qualification Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Upload Qualification Documents</h3>
                  <p className="text-gray-600 mb-4">Upload qualification certificates, SOC code documents, and application forms for AI analysis</p>
                  <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.doc" onChange={handleFileSelect} className="hidden" />
                  <Button className="bg-[#00c3ff] hover:bg-[#0099cc] text-white mb-4" onClick={() => fileInputRef.current?.click()}>Choose Files</Button>
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
                          <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
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
                        <Button className="bg-green-500 hover:bg-green-600 text-white w-full" onClick={handleUpload} disabled={uploading}>
                          {uploading ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" /> 
                              AI Processing...
                            </>
                          ) : (
                            <>
                              <GraduationCap className="h-4 w-4 mr-2" /> 
                              Analyze Qualifications ({selectedFiles.length} files)
                            </>
                          )}
                        </Button>
                        <Button 
                          className="bg-[#00c3ff] hover:bg-[#0099cc] text-white w-full" 
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Plus className="h-4 w-4 mr-2" /> 
                          Add More Files
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Assessment Results */}
            {(currentAssessment || selectedWorkerAssessment) && (
              <Card className={(currentAssessment?.redFlag || selectedWorkerAssessment?.redFlag) ? 'border-red-500 border-2' : ''}>
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <GraduationCap className="h-6 w-6 text-gray-600 mr-2" />
                    <CardTitle className="text-[#263976]">Qualification Compliance Analysis Report</CardTitle>
                  </div>
                  <p className="text-sm text-gray-600">Generated on {new Date((currentAssessment || selectedWorkerAssessment)?.generatedAt || '').toLocaleDateString('en-GB')} {new Date((currentAssessment || selectedWorkerAssessment)?.generatedAt || '').toLocaleTimeString('en-GB', { hour12: false })}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Serious Breach Alert */}
                  {(currentAssessment?.redFlag || selectedWorkerAssessment?.redFlag) && (
                    <div className="bg-red-500 text-white p-4 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-bold">SERIOUS QUALIFICATION BREACH DETECTED</span>
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <p>Qualification requirements not met - Immediate review required</p>
                    </div>
                  )}
                  {/* Professional Assessment */}
                  <div className="border-l-4 border-blue-300 bg-blue-50 p-6">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{(currentAssessment || selectedWorkerAssessment)?.professionalAssessment || ''}</div>
                  </div>
                  {/* Assessment Summary */}
                  <div>
                    <h4 className="font-medium mb-3 text-[#263976] flex items-center gap-2"><FileCheck className="h-4 w-4" /> Assessment Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div><label className="text-gray-600 font-medium">Worker:</label><p>{(currentAssessment || selectedWorkerAssessment)?.workerName || 'N/A'}</p></div>
                      <div><label className="text-gray-600 font-medium">CoS Reference:</label><p>{(currentAssessment || selectedWorkerAssessment)?.cosReference || 'N/A'}</p></div>
                      <div><label className="text-gray-600 font-medium">Job Title:</label><p>{(currentAssessment || selectedWorkerAssessment)?.jobTitle || 'N/A'}</p></div>
                      <div><label className="text-gray-600 font-medium">Qualification:</label><p>{(currentAssessment || selectedWorkerAssessment)?.qualification || 'N/A'}</p></div>
                      <div><label className="text-gray-600 font-medium">SOC Code:</label><p>{(currentAssessment || selectedWorkerAssessment)?.socCode || 'N/A'}</p></div>
                      <div><label className="text-gray-600 font-medium">Status:</label><p>{((currentAssessment || selectedWorkerAssessment)?.complianceStatus || 'N/A').replace(/_/g, ' ')}</p></div>
                    </div>
                  </div>
                  {/* Report Options */}
                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4 text-[#263976] flex items-center gap-2"><Download className="h-4 w-4" /> Report Options</h4>
                    <div className="mb-4"><label className="block text-sm font-medium mb-2">Email Address for Report:</label><input type="email" placeholder="Enter email address" className="w-full px-3 py-2 border rounded-lg" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} /></div>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleDownloadPDF}><Download className="h-4 w-4 mr-2" /> Download PDF</Button>
                      <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={handleEmailReport}><Mail className="h-4 w-4 mr-2" /> Email Report</Button>
                      <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={handlePrintReport}><Printer className="h-4 w-4 mr-2" /> Print Report</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        {/* AI Assistant Tab */}
        <TabsContent value="ai-assistant" activeTab={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle className="text-[#263976] flex items-center gap-2"><Bot className="h-5 w-5" /> AI Qualification Compliance Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-96 border rounded-lg p-4 bg-gray-50 overflow-y-auto">
                  <div className="space-y-3">
                    {chatMessages.map((message, index) => (
                      <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.role === 'user' ? 'bg-[#263976] text-white' : 'bg-white shadow-sm border'}`}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#263976]"></div>
                            <span className="text-sm">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Ask about qualification requirements, SOC codes, compliance..." className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c3ff]" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleChatSend()} disabled={chatLoading} />
                  <Button className="bg-[#263976] hover:bg-[#1e2a5a] text-white" onClick={handleChatSend} disabled={chatLoading || !chatInput.trim()}><Send className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 