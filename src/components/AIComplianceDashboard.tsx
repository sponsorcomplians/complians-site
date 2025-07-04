"use client";

import { useState, useRef, useEffect, Suspense } from "react";
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
  TrendingUp,
  Download,
  Eye,
  Send,
  Mail,
  Printer,
  Plus,
  PieChart,
  HelpCircle,
} from "lucide-react";
import AgentAssessmentExplainer from "./AgentAssessmentExplainer";
import { useSearchParams, usePathname } from "next/navigation";
import { AIComplianceService, ComplianceWorker, ComplianceAssessment } from "../lib/ai-compliance-service";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";

// Custom Card Components
const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 pb-2 ${className}`}>{children}</div>;

const CardTitle = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h3
    className={`text-lg font-semibold leading-none tracking-tight ${className}`}
  >
    {children}
  </h3>
);

const CardContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

// Custom Button Component
const Button = ({ 
  children, 
  className = "",
  size = "default",
  variant = "default",
  onClick,
  disabled = false,
  ...props 
}: { 
  children: React.ReactNode; 
  className?: string; 
  size?: "default" | "sm";
  variant?: "default" | "destructive" | "outline";
  onClick?: () => void;
  disabled?: boolean;
  [key: string]: any;
}) => {
  const sizeClasses = size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2";
  const variantClasses =
    variant === "destructive"
      ? "bg-red-500 hover:bg-red-600 text-white"
      : variant === "outline"
        ? "border border-gray-300 bg-white hover:bg-gray-50 text-gray-900"
        : "bg-gray-900 hover:bg-gray-800 text-white";
  
  return (
    <button 
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${sizeClasses} ${variantClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Custom Badge Component
const Badge = ({ 
  children, 
  variant = "default",
  className = "",
}: { 
  children: React.ReactNode; 
  variant?: "default" | "outline" | "destructive";
  className?: string;
}) => {
  const variantClasses =
    variant === "outline"
      ? "border border-current bg-transparent"
      : variant === "destructive"
        ? "bg-red-500 text-white animate-pulse"
        : "bg-gray-900 text-white";
  
  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variantClasses} ${className}`}
    >
      {children}
    </div>
  );
};

// Custom Tabs Components
const Tabs = ({ 
  children, 
  value, 
  onValueChange, 
  className = "",
}: { 
  children: React.ReactNode; 
  value: string; 
  onValueChange: (value: string) => void;
  className?: string;
}) => (
  <div className={className} data-value={value}>
    {children}
  </div>
);

const TabsList = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}
  >
    {children}
  </div>
);

const TabsTrigger = ({ 
  children, 
  value, 
  className = "",
  activeTab,
  onValueChange,
}: { 
  children: React.ReactNode; 
  value: string;
  className?: string;
  activeTab: string;
  onValueChange: (value: string) => void;
}) => {
  const isActive = activeTab === value;
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive 
          ? "bg-white text-gray-950 shadow-sm"
          : "text-gray-500 hover:text-gray-900"
      } ${className}`}
      onClick={() => onValueChange(value)}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ 
  children, 
  value, 
  activeTab,
}: { 
  children: React.ReactNode; 
  value: string;
  activeTab: string;
}) => {
  if (activeTab !== value) return null;
  return (
    <div className="mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2">
      {children}
    </div>
  );
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

          const x1 = 100 + 80 * Math.cos(((startAngle - 90) * Math.PI) / 180);
          const y1 = 100 + 80 * Math.sin(((startAngle - 90) * Math.PI) / 180);
          const x2 = 100 + 80 * Math.cos(((endAngle - 90) * Math.PI) / 180);
          const y2 = 100 + 80 * Math.sin(((endAngle - 90) * Math.PI) / 180);

          const largeArcFlag = percentage > 50 ? 1 : 0;
          
          const pathData = [
            `M 100 100`,
            `L ${x1} ${y1}`,
            `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            "Z",
          ].join(" ");
          
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
  const maxValue = Math.max(...data.map((item) => item.value));
  
  return (
    <div className="flex items-end justify-center space-x-2 h-40">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center">
          <div 
            className="w-12 bg-blue-500 rounded-t"
            style={{ height: `${(item.value / maxValue) * 120}px` }}
          ></div>
          <span className="text-xs mt-2 text-center">{item.name}</span>
          <span className="text-xs text-gray-500">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

// Types for our data structures
interface Worker {
  id: string;
  name: string;
  jobTitle: string;
  socCode: string;
  cosReference: string;
  complianceStatus: "COMPLIANT" | "BREACH" | "SERIOUS_BREACH";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  lastAssessment: string;
  redFlag: boolean;
  assignmentDate: string;
}

interface Assessment {
  id: string;
  workerId: string;
  workerName: string;
  cosReference: string;
  jobTitle: string;
  socCode: string;
  complianceStatus: "COMPLIANT" | "BREACH" | "SERIOUS_BREACH";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  evidenceStatus: string;
  breachType?: string;
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

// Agent-specific configurations
interface AgentConfig {
  title: string;
  description: string;
  chatWelcome: string;
  defaultJobTitle: string;
  defaultSocCode: string;
  breachType: string;
  evidenceStatus: string;
}

const agentConfigs: Record<string, AgentConfig> = {
  "ai-qualification-compliance": {
    title: "AI Qualification Compliance System",
    description:
      "AI-powered qualification compliance analysis for UK sponsors with red flag detection",
    chatWelcome:
      "Hello! I'm your AI compliance assistant. I can help you with questions about qualification requirements, SOC codes, Care Certificates, and compliance obligations. How can I assist you today?",
    defaultJobTitle: "Care Assistant",
    defaultSocCode: "6145",
    breachType: "NO_CARE_QUALIFICATIONS",
    evidenceStatus: "MISSING_CRITICAL",
  },
  "ai-salary-compliance": {
    title: "AI Salary Compliance System",
    description:
      "AI-powered salary compliance analysis with NMW and Home Office threshold monitoring",
    chatWelcome:
      "Hello! I'm your AI salary compliance assistant. I can help you with questions about National Minimum Wage, salary thresholds, payslip verification, and compliance obligations. How can I assist you today?",
    defaultJobTitle: "Care Assistant",
    defaultSocCode: "6145",
    breachType: "UNDERPAYMENT",
    evidenceStatus: "MISSING_PAYSLIPS",
  },
  "ai-right-to-work-compliance": {
    title: "AI Right to Work Compliance System",
    description:
      "AI-powered right to work verification with Home Office integration and status monitoring",
    chatWelcome:
      "Hello! I'm your AI right to work compliance assistant. I can help you with questions about RTW checks, visa status, Home Office verification, and compliance obligations. How can I assist you today?",
    defaultJobTitle: "Care Assistant",
    defaultSocCode: "6145",
    breachType: "EXPIRED_RTW",
    evidenceStatus: "MISSING_RTW_DOCUMENTS",
  },
  "ai-skills-experience-compliance": {
    title: "AI Skills & Experience Compliance System",
    description:
      "AI-powered skills and experience verification for sponsored workers, with gap analysis and compliance risk detection.",
    chatWelcome:
      "Hello! I'm your AI skills & experience compliance assistant. I can help you with questions about skills, experience, CVs, references, and compliance for sponsored workers. How can I assist you today?",
    defaultJobTitle: "Care Assistant",
    defaultSocCode: "6145",
    breachType: "INSUFFICIENT_EXPERIENCE",
    evidenceStatus: "MISSING_EXPERIENCE_DOCS",
  },
  "ai-genuine-vacancies-compliance": {
    title: "AI Genuine Vacancies Compliance System",
    description:
      "AI-powered analysis of genuine vacancy requirements and recruitment compliance for UK sponsors.",
    chatWelcome:
      "Hello! I'm your AI genuine vacancies compliance assistant. I can help you with questions about vacancy authenticity, recruitment processes, market rate, and compliance. How can I assist you today?",
    defaultJobTitle: "Registered Nurse",
    defaultSocCode: "2231",
    breachType: "NOT_GENUINE_VACANCY",
    evidenceStatus: "MISSING_VACANCY_EVIDENCE",
  },
  "ai-third-party-labour-compliance": {
    title: "AI Third-Party Labour Compliance System",
    description:
      "AI-powered monitoring and compliance checking for third-party labour arrangements.",
    chatWelcome:
      "Hello! I'm your AI third-party labour compliance assistant. I can help you with questions about third-party arrangements, labour provider verification, contract compliance, and risk assessment. How can I assist you today?",
    defaultJobTitle: "Care Assistant",
    defaultSocCode: "6141",
    breachType: "THIRD_PARTY_ARRANGEMENT_BREACH",
    evidenceStatus: "MISSING_THIRD_PARTY_EVIDENCE",
  },
  "ai-reporting-duties-compliance": {
    title: "AI Reporting Duties Compliance System",
    description:
      "AI-powered automated monitoring and compliance checking for sponsor reporting obligations.",
    chatWelcome:
      "Hello! I'm your AI reporting duties compliance assistant. I can help you with questions about reporting deadlines, obligations, compliance status, and automated alerts. How can I assist you today?",
    defaultJobTitle: "Software Developer",
    defaultSocCode: "2136",
    breachType: "REPORTING_DUTIES_BREACH",
    evidenceStatus: "MISSING_REPORTING_EVIDENCE",
  },
  "ai-immigration-status-monitoring-compliance": {
    title: "AI Immigration Status Monitoring System",
    description:
      "AI-powered real-time monitoring and compliance checking for migrant worker immigration status.",
    chatWelcome:
      "Hello! I'm your AI immigration status monitoring assistant. I can help you with questions about visa status, immigration compliance, status changes, and real-time monitoring. How can I assist you today?",
    defaultJobTitle: "Marketing Manager",
    defaultSocCode: "1132",
    breachType: "IMMIGRATION_STATUS_BREACH",
    evidenceStatus: "MISSING_IMMIGRATION_EVIDENCE",
  },
  "ai-record-keeping-compliance": {
    title: "AI Record Keeping Compliance System",
    description:
      "AI-powered comprehensive record keeping compliance and document management for UK sponsors.",
    chatWelcome:
      "Hello! I'm your AI record keeping compliance assistant. I can help you with questions about document management, record verification, compliance assurance, and audit readiness. How can I assist you today?",
    defaultJobTitle: "Accountant",
    defaultSocCode: "2421",
    breachType: "RECORD_KEEPING_BREACH",
    evidenceStatus: "MISSING_RECORD_EVIDENCE",
  },
  "ai-migrant-contact-maintenance-compliance": {
    title: "AI Migrant Contact Maintenance System",
    description:
      "AI-powered automated monitoring and compliance checking for maintaining migrant worker contact.",
    chatWelcome:
      "Hello! I'm your AI migrant contact maintenance assistant. I can help you with questions about contact record keeping, communication tracking, and compliance assurance. How can I assist you today?",
    defaultJobTitle: "Support Worker",
    defaultSocCode: "6141",
    breachType: "CONTACT_MAINTENANCE_BREACH",
    evidenceStatus: "MISSING_CONTACT_EVIDENCE",
  },
  "ai-recruitment-practices-compliance": {
    title: "AI Recruitment Practices Compliance System",
    description:
      "AI-powered monitoring and compliance checking for recruitment practices and policies.",
    chatWelcome:
      "Hello! I'm your AI recruitment practices compliance assistant. I can help you with questions about recruitment process, policy compliance, and transparency. How can I assist you today?",
    defaultJobTitle: "Recruitment Officer",
    defaultSocCode: "1136",
    breachType: "RECRUITMENT_PRACTICES_BREACH",
    evidenceStatus: "MISSING_RECRUITMENT_EVIDENCE",
  },
  "ai-migrant-tracking-compliance": {
    title: "AI Migrant Tracking Compliance System",
    description:
      "AI-powered comprehensive tracking and compliance monitoring for migrant worker activities.",
    chatWelcome:
      "Hello! I'm your AI migrant tracking compliance assistant. I can help you with questions about activity tracking, compliance monitoring, and activity verification. How can I assist you today?",
    defaultJobTitle: "Logistics Coordinator",
    defaultSocCode: "3541",
    breachType: "MIGRANT_TRACKING_BREACH",
    evidenceStatus: "MISSING_TRACKING_EVIDENCE",
  },
  "ai-contracted-hours-compliance": {
    title: "AI Contracted Hours Compliance System",
    description: "Checks working hours against contract and legal limits.",
    chatWelcome:
      "Hello! I'm your AI contracted hours compliance assistant. I can help you with questions about working hours, contract compliance, and legal limits. How can I assist you today?",
    defaultJobTitle: "Care Assistant",
    defaultSocCode: "6145",
    breachType: "CONTRACTED_HOURS_BREACH",
    evidenceStatus: "MISSING_HOURS_EVIDENCE",
  },
  "ai-paragraph-c7-26-compliance": {
    title: "AI Paragraph C7-26 Compliance System",
    description: "Monitors compliance with Paragraph C7-26 requirements.",
    chatWelcome:
      "Hello! I'm your AI Paragraph C7-26 compliance assistant. I can help you with questions about C7-26 obligations, compliance, and reporting. How can I assist you today?",
    defaultJobTitle: "Compliance Officer",
    defaultSocCode: "2429",
    breachType: "PARAGRAPH_C7_26_BREACH",
    evidenceStatus: "MISSING_C7_26_EVIDENCE",
  },
};

// Add prop types
interface AIComplianceDashboardProps {
  storagePrefix?: string;
  extractNameFunction?: (files: File[]) => any[];
  documentType?: string;
  complianceType?: string;
  title?: string;
  description?: string;
}

// Main content component that uses useSearchParams
function AIComplianceDashboardContent({
  storagePrefix = 'compliance',
  extractNameFunction,
  documentType = 'Compliance Document',
  complianceType = 'Compliance Assessment',
  title = 'AI Compliance Dashboard',
  description = 'Automated compliance analysis and reporting.',
}: AIComplianceDashboardProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const initialTab = searchParams?.get("tab") || "dashboard";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Extract agent key from pathname
  const agentKey =
    pathname?.split("/").find((seg) => seg.startsWith("ai-")) ||
    "ai-qualification-compliance";
  const agentConfig =
    agentConfigs[agentKey] || agentConfigs["ai-qualification-compliance"];

  // Authentication and service state
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<AIComplianceService | null>(null);

  // Data state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<ComplianceAssessment | null>(null);
  const [selectedWorkerAssessment, setSelectedWorkerAssessment] = useState<ComplianceAssessment | null>(null);
  const [workers, setWorkers] = useState<ComplianceWorker[]>([]);
  const [assessments, setAssessments] = useState<ComplianceAssessment[]>([]);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: agentConfig.chatWelcome,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update localStorage keys
  const workersKey = `${storagePrefix}ComplianceWorkers`;
  const assessmentsKey = `${storagePrefix}ComplianceAssessments`;

  // Data persistence for workers and assessments
  useEffect(() => {
    const savedWorkers = localStorage.getItem(workersKey);
    if (savedWorkers) {
      try { setWorkers(JSON.parse(savedWorkers)); } catch (e) { console.error('Error loading saved workers:', e); }
    }
  }, []);
  useEffect(() => {
    if (workers.length > 0) {
      localStorage.setItem(workersKey, JSON.stringify(workers));
    }
  }, [workers]);
  useEffect(() => {
    const savedAssessments = localStorage.getItem(assessmentsKey);
    if (savedAssessments) {
      try { setAssessments(JSON.parse(savedAssessments)); } catch (e) { console.error('Error loading saved assessments:', e); }
    }
  }, []);
  useEffect(() => {
    if (assessments.length > 0) {
      localStorage.setItem(assessmentsKey, JSON.stringify(assessments));
    }
  }, [assessments]);

  // Initialize authentication and service
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          const complianceService = new AIComplianceService(currentUser);
          setService(complianceService);
          
          // Load data
          await loadData(complianceService);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const complianceService = new AIComplianceService(session.user);
          setService(complianceService);
          await loadData(complianceService);
        } else {
          setService(null);
          setWorkers([]);
          setAssessments([]);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [agentKey]);

  // Load data from Supabase
  const loadData = async (complianceService: AIComplianceService) => {
    try {
      const [workersData, assessmentsData] = await Promise.all([
        complianceService.getWorkers(agentKey),
        complianceService.getAssessments(agentKey)
      ]);

      setWorkers(workersData);
      setAssessments(assessmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Calculate dashboard stats dynamically
  const dashboardStats = {
    totalWorkers: workers.length,
    compliantWorkers: workers.filter((w) => w.compliance_status === "COMPLIANT").length,
    redFlags: workers.filter((w) => w.red_flag).length,
    highRisk: workers.filter((w) => w.risk_level === "HIGH").length,
    complianceRate:
      workers.length > 0
        ? Math.round(
            (workers.filter((w) => w.compliance_status === "COMPLIANT").length /
              workers.length) *
              100,
          )
        : 0,
  };

  // Chart data - recalculated when workers change
  const pieChartData = [
    {
      name: "Compliant",
      value: workers.filter((w) => w.compliance_status === "COMPLIANT").length,
      color: "#10B981",
    },
    {
      name: "Breach",
      value: workers.filter((w) => w.compliance_status === "BREACH").length,
      color: "#F59E0B",
    },
    {
      name: "Serious Breach",
      value: workers.filter((w) => w.compliance_status === "SERIOUS_BREACH").length,
      color: "#EF4444",
    },
  ];

  const barChartData = [
    {
      name: "Low Risk",
      value: workers.filter((w) => w.risk_level === "LOW").length,
    },
    {
      name: "Medium Risk",
      value: workers.filter((w) => w.risk_level === "MEDIUM").length,
    },
    {
      name: "High Risk",
      value: workers.filter((w) => w.risk_level === "HIGH").length,
    },
  ];

  // Helper function for status badges
  const getStatusBadge = (status: string, redFlag: boolean = false) => {
    if (redFlag || status === 'SERIOUS_BREACH') {
      return (
        <Badge variant="destructive" className="bg-red-500 text-white animate-pulse">
          SERIOUS BREACH
        </Badge>
      )
    }
    
    switch (status) {
      case 'COMPLIANT':
        return <Badge className="bg-green-500 text-white">COMPLIANT</Badge>
      case 'UNDERPAID':
        return <Badge variant="destructive" className="bg-orange-500 text-white">UNDERPAID</Badge>
      case 'NON_COMPLIANT':
        return <Badge variant="destructive" className="bg-red-500 text-white">NON-COMPLIANT</Badge>
      default:
        return <Badge variant="outline">{status || 'UNKNOWN'}</Badge>
    }
  }

  // Helper function for risk badges
  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return <Badge className="bg-green-500 text-white">LOW RISK</Badge>
      case 'MEDIUM':
        return <Badge className="bg-yellow-500 text-white">MEDIUM RISK</Badge>
      case 'HIGH':
        return <Badge variant="destructive" className="bg-red-500 text-white">HIGH RISK</Badge>
      default:
        return <Badge variant="outline">{risk || 'UNKNOWN'}</Badge>
    }
  }

  // Name extraction (customizable)
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (extractNameFunction) {
      const extracted = extractNameFunction(files);
      // ... handle extracted data as needed ...
      } else {
      // Default extraction logic (fallback)
      // ... existing logic ...
    }
  };

  // PDF generation (customizable)
  const handleDownloadPDF = async () => {
    if (!currentAssessment && !selectedWorkerAssessment) {
      alert('No assessment report available to download.');
      return;
    }
    const assessment = currentAssessment || selectedWorkerAssessment;
    if (!assessment) return;
    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text(`${documentType} ${complianceType} Report`, 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`, 105, 30, { align: 'center' });
      let yPos = 40;
      doc.setFontSize(14);
      doc.text('Assessment Summary', 10, yPos);
      yPos += 10;
      doc.setFontSize(10);
      const a: any = assessment;
      doc.text(`Worker: ${a.workerName || a.worker_name || ''}`, 10, yPos); yPos += 7;
      doc.text(`Document: ${a.documentName || a.document_name || documentType}`, 10, yPos); yPos += 7;
      doc.text(`Assessment Type: ${a.assessmentType || complianceType}`, 10, yPos); yPos += 7;
      doc.text(`Status: ${a.status || a.complianceStatus || a.compliance_status || ''}`, 10, yPos); yPos += 7;
      yPos += 10;
      doc.setFontSize(14);
      doc.text('Findings', 10, yPos); yPos += 10;
      doc.setFontSize(9);
      const findingsLines = doc.splitTextToSize(a.findings || a.professionalAssessment || a.professional_assessment || '', 180);
      findingsLines.forEach((line: string) => { if (yPos > 270) { doc.addPage(); yPos = 20; } doc.text(line, 10, yPos); yPos += 5; });
      yPos += 10;
      doc.setFontSize(14);
      doc.text('Recommendations', 10, yPos); yPos += 10;
      doc.setFontSize(9);
      const recLines = doc.splitTextToSize(a.recommendations || '', 180);
      recLines.forEach((line: string) => { if (yPos > 270) { doc.addPage(); yPos = 20; } doc.text(line, 10, yPos); yPos += 5; });
      doc.save(`${documentType.replace(/\s+/g, '_')}_${complianceType.replace(/\s+/g, '_')}_Report_${a.workerName?.replace(/\s+/g, '_') || a.worker_name?.replace(/\s+/g, '_') || ''}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Email report with recipient input
  const [recipientEmail, setRecipientEmail] = useState('');
  const handleEmailReport = async () => {
    if (!currentAssessment && !selectedWorkerAssessment) {
      alert('No assessment report available to email.');
      return;
    }
    const assessment = currentAssessment || selectedWorkerAssessment;
    const emailHTML = assessment ? `
      <h2>${documentType} ${complianceType} Report</h2>
      <p><strong>Worker:</strong> ${assessment.worker_name || 'Unknown'}</p>
      <p><strong>Document:</strong> ${documentType}</p>
      <p><strong>Assessment Type:</strong> ${complianceType}</p>
      <p><strong>Status:</strong> ${assessment.compliance_status || 'Unknown'}</p>
      <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
      <hr>
      <div>${assessment.professional_assessment || 'No details available'}</div>
    ` : '';
    try {
      const response = await fetch('/api/send-report-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail || prompt('Enter email address:') || 'compliance@company.com',
          subject: `${documentType} ${complianceType} Report - ${assessment?.worker_name || 'Unknown'}`,
          html: emailHTML,
          workerName: assessment?.worker_name || 'Unknown',
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email');
      }
      alert('Report sent successfully via email!');
    } catch (error) {
      console.error('❌ Email error:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  // Delete worker and update localStorage
  const handleDeleteWorker = (workerId: string) => {
    if (confirm('Are you sure you want to delete this worker?')) {
      const updatedWorkers = workers.filter((w) => w.id !== workerId);
      setWorkers(updatedWorkers);
      localStorage.setItem(workersKey, JSON.stringify(updatedWorkers));
      // Remove associated assessments
      const updatedAssessments = assessments.filter((a) => a.worker_id !== workerId);
      setAssessments(updatedAssessments);
      localStorage.setItem(assessmentsKey, JSON.stringify(updatedAssessments));
    }
  };

  // View worker report
  const handleViewWorkerReport = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    const assessment = assessments.find(a => a.worker_id === workerId);
    if (worker && assessment) {
      setSelectedWorkerAssessment(assessment);
      setActiveTab('assessment');
    }
  };

  // Help with breach
  const handleHelpWithBreach = (workerName: string) => {
    const helpMessage = `I can help you with compliance issues for ${workerName}. What specific breach are you dealing with?`;
    setChatMessages(prev => [...prev, {
      role: 'assistant',
      content: helpMessage,
      timestamp: new Date().toISOString()
    }]);
    setActiveTab('ai-assistant');
  };

  // Upload handler
  const handleUpload = async () => {
    if (!selectedFiles.length) {
      alert('Please select files to upload.');
      return;
    }
    if (!service) {
      alert('Service not available. Please try again.');
      return;
    }

    setUploading(true);
    try {
      const result = await service.uploadDocuments(selectedFiles, agentKey);
      if (result.worker) {
        setWorkers(prev => [...prev, result.worker!]);
      }
      if (result.assessment) {
        setAssessments(prev => [...prev, result.assessment!]);
        setCurrentAssessment(result.assessment);
      }
      setSelectedFiles([]);
      alert('Upload successful!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Print report
  const handlePrintReport = () => {
    if (!currentAssessment && !selectedWorkerAssessment) {
      alert('No assessment report available to print.');
      return;
    }
    window.print();
  };

  // Chat send handler
  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      role: 'user' as const,
      content: chatInput,
      timestamp: new Date().toISOString(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      // Simulate AI response
      const aiResponse = {
        role: 'assistant' as const,
        content: `I understand your question about "${chatInput}". Let me help you with that. This is a simulated response from the AI assistant.`,
        timestamp: new Date().toISOString(),
      };

      setTimeout(() => {
        setChatMessages(prev => [...prev, aiResponse]);
        setChatLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Chat error:', error);
      setChatLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading compliance dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication prompt
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-4">
                Please sign in to access the AI Compliance Dashboard and manage your workers and assessments.
              </p>
              <Button 
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => window.location.href = '/auth/signin'}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-dark mb-2 flex items-center gap-3">
          <Bot className="h-8 w-8 text-brand-light" />
          {agentConfig.title}
        </h1>
        <p className="text-gray-600">{agentConfig.description}</p>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger
            value="dashboard"
            className="flex items-center gap-2"
            activeTab={activeTab}
            onValueChange={setActiveTab}
          >
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="workers"
            className="flex items-center gap-2"
            activeTab={activeTab}
            onValueChange={setActiveTab}
          >
            <Users className="h-4 w-4" />
            Workers
          </TabsTrigger>
          <TabsTrigger
            value="assessment"
            className="flex items-center gap-2"
            activeTab={activeTab}
            onValueChange={setActiveTab}
          >
            <FileText className="h-4 w-4" />
            Assessment
          </TabsTrigger>
          <TabsTrigger
            value="ai-assistant"
            className="flex items-center gap-2"
            activeTab={activeTab}
            onValueChange={setActiveTab}
          >
            <MessageSquare className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" activeTab={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Workers
                </CardTitle>
                <Users className="h-4 w-4 text-brand-light" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-brand-dark">
                  {dashboardStats.totalWorkers}
                </div>
                <p className="text-xs text-gray-600">Active workers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Compliance Rate
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-brand-dark">
                  {dashboardStats.complianceRate}%
                </div>
                <p className="text-xs text-gray-600">
                  {dashboardStats.compliantWorkers} compliant workers
                </p>
              </CardContent>
            </Card>

            <Card
              className={
                dashboardStats.redFlags > 0
                  ? "border-red-500 border-2 animate-pulse"
                  : ""
              }
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  🚨 Red Flags
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {dashboardStats.redFlags}
                </div>
                <p className="text-xs text-red-600">
                  Immediate attention required
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-brand-dark">
                  {dashboardStats.highRisk}
                </div>
                <p className="text-xs text-gray-600">High risk workers</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-brand-dark flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Compliance Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PieChartComponent data={pieChartData} />
                <div className="flex justify-center space-x-4 mt-4">
                  {pieChartData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-brand-dark flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Risk Level Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChartComponent data={barChartData} />
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-brand-dark">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {workers
                .slice(-3)
                .reverse()
                .map((worker, index) => (
                  <div key={worker.id} className="flex items-center space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full ${worker.red_flag ? "bg-red-500 animate-pulse" : worker.compliance_status === "COMPLIANT" ? "bg-green-500" : "bg-yellow-500"}`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {worker.red_flag
                          ? `Red flag detected for ${worker.name}`
                          : worker.compliance_status === "COMPLIANT"
                            ? `${worker.name} assessment completed`
                            : `${worker.name} requires review`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {worker.red_flag
                          ? agentKey === "ai-right-to-work-compliance"
                            ? `${worker.job_title} - RTW verification failed`
                            : `${worker.job_title} without qualifications`
                          : worker.compliance_status === "COMPLIANT"
                            ? agentKey === "ai-right-to-work-compliance"
                              ? "RTW status confirmed"
                              : "Compliant status confirmed"
                            : agentKey === "ai-right-to-work-compliance"
                              ? "Missing RTW documents"
                              : "Missing training certificates"}{" "}
                        - {worker.last_assessment_date}
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
                <CardTitle className="text-brand-dark flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Workers
                </CardTitle>
                <p className="text-gray-600 text-sm mt-1">
                  {agentKey === "ai-right-to-work-compliance"
                    ? "Manage sponsored workers and their right to work status"
                    : agentKey === "ai-salary-compliance"
                      ? "Manage sponsored workers and their salary compliance"
                      : "Manage sponsored workers and their qualifications"}
                </p>
              </div>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Worker
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-900 text-white">
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">
                        CoS Reference
                      </th>
                      <th className="text-left p-4 font-medium">Job Title</th>
                      <th className="text-left p-4 font-medium">SOC Code</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Risk Level</th>
                      <th className="text-left p-4 font-medium">
                        View Compliance Report
                      </th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.map((worker) => {
                      console.log('DISPLAY WORKER NAME:', worker);
                      return (
                        <tr
                          key={worker.id}
                          className={`border-b ${worker.red_flag ? "bg-red-50" : ""}`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {worker.name}
                              {worker.red_flag && (
                                <span className="text-red-500 text-xs animate-pulse">
                                  🚨
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">{worker.cos_reference}</td>
                          <td className="p-4">{worker.job_title}</td>
                          <td className="p-4">{worker.soc_code}</td>
                          <td className="p-4">
                            {getStatusBadge(
                              worker.compliance_status,
                              worker.red_flag,
                            )}
                          </td>
                          <td className="p-4">
                            {getRiskBadge(worker.risk_level)}
                          </td>
                          <td className="p-4">
                            <Button
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                              onClick={() => handleViewWorkerReport(worker.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Report
                            </Button>
                          </td>
                          <td className="p-4">
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white"
                              onClick={() => handleHelpWithBreach(worker.name)}
                            >
                              <HelpCircle className="h-4 w-4 mr-1" />
                              Help with Breach
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessment Tab */}
        <TabsContent value="assessment" activeTab={activeTab}>
          <div className="space-y-6">
            <AgentAssessmentExplainer />
            <Card>
              <CardHeader>
                <CardTitle className="text-brand-dark flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Document Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Upload Compliance Documents
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {agentKey === "ai-right-to-work-compliance"
                      ? "Upload CoS certificate, passport, biometric residence permit, and RTW documents for AI analysis"
                      : agentKey === "ai-salary-compliance"
                        ? "Upload CoS certificate, payslips, salary documents, and employment contracts for AI analysis"
                        : "Upload CoS certificate, CV, qualification documents, and application forms for AI analysis"}
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <Button
                    className="bg-brand-light hover:bg-brand-light text-white mb-4"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose Files
                  </Button>

                  {selectedFiles.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Selected Files:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {selectedFiles.map((file, index) => (
                          <li
                            key={index}
                            className="flex items-center justify-center gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            {file.name}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="bg-green-500 hover:bg-green-600 text-white mt-4"
                        onClick={handleUpload}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            AI Processing...
                          </>
                        ) : (
                          <>
                            <Bot className="h-4 w-4 mr-2" />
                            Analyze Documents
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Assessment Results */}
            {(currentAssessment || selectedWorkerAssessment) && (
              <Card
                className={
                  currentAssessment?.red_flag ||
                  selectedWorkerAssessment?.red_flag
                    ? "border-red-500 border-2"
                    : ""
                }
              >
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <FileText className="h-6 w-6 text-gray-600 mr-2" />
                    <CardTitle className="text-brand-dark">
                      Compliance Analysis Report
                    </CardTitle>
                  </div>
                  <p className="text-sm text-gray-600">
                    Generated on{" "}
                    {new Date(
                      (currentAssessment || selectedWorkerAssessment)
                        ?.generated_at || "",
                    ).toLocaleDateString("en-GB")}{" "}
                    {new Date(
                      (currentAssessment || selectedWorkerAssessment)
                        ?.generated_at || "",
                    ).toLocaleTimeString("en-GB", { hour12: false })}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Serious Breach Alert */}
                  {(currentAssessment?.red_flag ||
                    selectedWorkerAssessment?.red_flag) && (
                    <div className="bg-red-500 text-white p-4 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-bold">
                          SERIOUS BREACH DETECTED
                        </span>
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <p>
                        {agentKey === "ai-right-to-work-compliance"
                          ? "Right to work verification failed - Immediate review required"
                          : agentKey === "ai-salary-compliance"
                            ? "Salary compliance breach detected - Immediate review required"
                            : "Qualification requirements not met - Immediate review required"}
                      </p>
                    </div>
                  )}

                  {/* Professional Assessment */}
                  <div className="border-l-4 border-blue-300 bg-blue-50 p-6">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                      {
                        (currentAssessment || selectedWorkerAssessment)
                          ?.professional_assessment
                      }
                    </div>
                  </div>

                  {/* Assessment Summary */}
                  <div>
                    <h4 className="font-medium mb-3 text-brand-dark flex items-center gap-2">
                      <FileCheck className="h-4 w-4" />
                      Assessment Summary
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <label className="text-gray-600 font-medium">
                          Worker:
                        </label>
                        <p>
                          {
                            (currentAssessment || selectedWorkerAssessment)
                              ?.worker_name
                          }
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-600 font-medium">
                          CoS Reference:
                        </label>
                        <p>
                          {
                            (currentAssessment || selectedWorkerAssessment)
                              ?.cos_reference
                          }
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-600 font-medium">
                          Job Title:
                        </label>
                        <p>
                          {
                            (currentAssessment || selectedWorkerAssessment)
                              ?.job_title
                          }
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-600 font-medium">
                          SOC Code:
                        </label>
                        <p>
                          {
                            (currentAssessment || selectedWorkerAssessment)
                              ?.soc_code
                          }
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-600 font-medium">
                          Assignment Date:
                        </label>
                        <p>
                          {
                            (currentAssessment || selectedWorkerAssessment)
                              ?.assignment_date
                          }
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-600 font-medium">
                          Status:
                        </label>
                        <div className="mt-1">
                          {getStatusBadge(
                            (currentAssessment || selectedWorkerAssessment)
                              ?.compliance_status || "",
                            (currentAssessment || selectedWorkerAssessment)
                              ?.red_flag,
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Report Options */}
                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4 text-brand-dark flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Report Options
                    </h4>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Button
                        className="bg-red-500 hover:bg-red-600 text-white"
                        onClick={handleDownloadPDF}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={handleEmailReport}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email Report
                      </Button>
                      <Button
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={handlePrintReport}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print Report
                      </Button>
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
              <CardTitle className="text-brand-dark flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Compliance Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-96 border rounded-lg p-4 bg-gray-50 overflow-y-auto">
                  <div className="space-y-3">
                    {chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.role === "user"
                              ? "bg-brand-dark text-white"
                              : "bg-white shadow-sm border"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-dark"></div>
                            <span className="text-sm">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask about compliance requirements, SOC codes, Care Certificates..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleChatSend()}
                    disabled={chatLoading}
                  />
                  <Button
                    className="bg-brand-dark hover:bg-brand-light text-white"
                    onClick={handleChatSend}
                    disabled={chatLoading || !chatInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AIComplianceDashboard({
  storagePrefix = 'compliance',
  extractNameFunction,
  documentType = 'Compliance Document',
  complianceType = 'Compliance Assessment',
  title = 'AI Compliance Dashboard',
  description = 'Automated compliance analysis and reporting.',
}: AIComplianceDashboardProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const initialTab = searchParams?.get("tab") || "dashboard";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Extract agent key from pathname
  const agentKey =
    pathname?.split("/").find((seg) => seg.startsWith("ai-")) ||
    "ai-qualification-compliance";
  const agentConfig =
    agentConfigs[agentKey] || agentConfigs["ai-qualification-compliance"];

  // Authentication and service state
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<AIComplianceService | null>(null);

  // Data state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<ComplianceAssessment | null>(null);
  const [selectedWorkerAssessment, setSelectedWorkerAssessment] = useState<ComplianceAssessment | null>(null);
  const [workers, setWorkers] = useState<ComplianceWorker[]>([]);
  const [assessments, setAssessments] = useState<ComplianceAssessment[]>([]);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: agentConfig.chatWelcome,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update localStorage keys
  const workersKey = `${storagePrefix}ComplianceWorkers`;
  const assessmentsKey = `${storagePrefix}ComplianceAssessments`;

  // Data persistence for workers and assessments
  useEffect(() => {
    const savedWorkers = localStorage.getItem(workersKey);
    if (savedWorkers) {
      try { setWorkers(JSON.parse(savedWorkers)); } catch (e) { console.error('Error loading saved workers:', e); }
    }
  }, []);
  useEffect(() => {
    if (workers.length > 0) {
      localStorage.setItem(workersKey, JSON.stringify(workers));
    }
  }, [workers]);
  useEffect(() => {
    const savedAssessments = localStorage.getItem(assessmentsKey);
    if (savedAssessments) {
      try { setAssessments(JSON.parse(savedAssessments)); } catch (e) { console.error('Error loading saved assessments:', e); }
    }
  }, []);
  useEffect(() => {
    if (assessments.length > 0) {
      localStorage.setItem(assessmentsKey, JSON.stringify(assessments));
    }
  }, [assessments]);

  // Initialize authentication and service
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          const complianceService = new AIComplianceService(currentUser);
          setService(complianceService);
          
          // Load data
          await loadData(complianceService);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const complianceService = new AIComplianceService(session.user);
          setService(complianceService);
          await loadData(complianceService);
        } else {
          setService(null);
          setWorkers([]);
          setAssessments([]);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [agentKey]);

  // Load data from Supabase
  const loadData = async (complianceService: AIComplianceService) => {
    try {
      const [workersData, assessmentsData] = await Promise.all([
        complianceService.getWorkers(agentKey),
        complianceService.getAssessments(agentKey)
      ]);

      setWorkers(workersData);
      setAssessments(assessmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Calculate dashboard stats dynamically
  const dashboardStats = {
    totalWorkers: workers.length,
    compliantWorkers: workers.filter((w) => w.compliance_status === "COMPLIANT").length,
    redFlags: workers.filter((w) => w.red_flag).length,
    highRisk: workers.filter((w) => w.risk_level === "HIGH").length,
    complianceRate:
      workers.length > 0
        ? Math.round(
            (workers.filter((w) => w.compliance_status === "COMPLIANT").length /
              workers.length) *
              100,
          )
        : 0,
  };

  // Chart data - recalculated when workers change
  const pieChartData = [
    {
      name: "Compliant",
      value: workers.filter((w) => w.compliance_status === "COMPLIANT").length,
      color: "#10B981",
    },
    {
      name: "Breach",
      value: workers.filter((w) => w.compliance_status === "BREACH").length,
      color: "#F59E0B",
    },
    {
      name: "Serious Breach",
      value: workers.filter((w) => w.compliance_status === "SERIOUS_BREACH").length,
      color: "#EF4444",
    },
  ];

  const barChartData = [
    {
      name: "Low Risk",
      value: workers.filter((w) => w.risk_level === "LOW").length,
    },
    {
      name: "Medium Risk",
      value: workers.filter((w) => w.risk_level === "MEDIUM").length,
    },
    {
      name: "High Risk",
      value: workers.filter((w) => w.risk_level === "HIGH").length,
    },
  ];

  // Helper function for status badges
  const getStatusBadge = (status: string, redFlag: boolean = false) => {
    if (redFlag || status === 'SERIOUS_BREACH') {
      return (
        <Badge variant="destructive" className="bg-red-500 text-white animate-pulse">
          SERIOUS BREACH
        </Badge>
      )
    }
    
    switch (status) {
      case 'COMPLIANT':
        return <Badge className="bg-green-500 text-white">COMPLIANT</Badge>
      case 'UNDERPAID':
        return <Badge variant="destructive" className="bg-orange-500 text-white">UNDERPAID</Badge>
      case 'NON_COMPLIANT':
        return <Badge variant="destructive" className="bg-red-500 text-white">NON-COMPLIANT</Badge>
      default:
        return <Badge variant="outline">{status || 'UNKNOWN'}</Badge>
    }
  }

  // Helper function for risk badges
  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return <Badge className="bg-green-500 text-white">LOW RISK</Badge>
      case 'MEDIUM':
        return <Badge className="bg-yellow-500 text-white">MEDIUM RISK</Badge>
      case 'HIGH':
        return <Badge variant="destructive" className="bg-red-500 text-white">HIGH RISK</Badge>
      default:
        return <Badge variant="outline">{risk || 'UNKNOWN'}</Badge>
    }
  }

  // Name extraction (customizable)
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (extractNameFunction) {
      const extracted = extractNameFunction(files);
      // ... handle extracted data as needed ...
    } else {
      // Default extraction logic (fallback)
      // ... existing logic ...
    }
  };

  // PDF generation (customizable)
  const handleDownloadPDF = async () => {
    if (!currentAssessment && !selectedWorkerAssessment) {
      alert('No assessment report available to download.');
      return;
    }
    const assessment = currentAssessment || selectedWorkerAssessment;
    if (!assessment) return;
    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text(`${documentType} ${complianceType} Report`, 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`, 105, 30, { align: 'center' });
      let yPos = 40;
      doc.setFontSize(14);
      doc.text('Assessment Summary', 10, yPos);
      yPos += 10;
      doc.setFontSize(10);
      const a: any = assessment;
      doc.text(`Worker: ${a.workerName || a.worker_name || ''}`, 10, yPos); yPos += 7;
      doc.text(`Document: ${a.documentName || a.document_name || documentType}`, 10, yPos); yPos += 7;
      doc.text(`Assessment Type: ${a.assessmentType || complianceType}`, 10, yPos); yPos += 7;
      doc.text(`Status: ${a.status || a.complianceStatus || a.compliance_status || ''}`, 10, yPos); yPos += 7;
      yPos += 10;
      doc.setFontSize(14);
      doc.text('Findings', 10, yPos); yPos += 10;
      doc.setFontSize(9);
      const findingsLines = doc.splitTextToSize(a.findings || a.professionalAssessment || a.professional_assessment || '', 180);
      findingsLines.forEach((line: string) => { if (yPos > 270) { doc.addPage(); yPos = 20; } doc.text(line, 10, yPos); yPos += 5; });
      yPos += 10;
      doc.setFontSize(14);
      doc.text('Recommendations', 10, yPos); yPos += 10;
      doc.setFontSize(9);
      const recLines = doc.splitTextToSize(a.recommendations || '', 180);
      recLines.forEach((line: string) => { if (yPos > 270) { doc.addPage(); yPos = 20; } doc.text(line, 10, yPos); yPos += 5; });
      doc.save(`${documentType.replace(/\s+/g, '_')}_${complianceType.replace(/\s+/g, '_')}_Report_${a.workerName?.replace(/\s+/g, '_') || a.worker_name?.replace(/\s+/g, '_') || ''}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Email report with recipient input
  const [recipientEmail, setRecipientEmail] = useState('');
  const handleEmailReport = async () => {
    if (!currentAssessment && !selectedWorkerAssessment) {
      alert('No assessment report available to email.');
      return;
    }
    const assessment = currentAssessment || selectedWorkerAssessment;
    const emailHTML = assessment ? `
      <h2>${documentType} ${complianceType} Report</h2>
      <p><strong>Worker:</strong> ${assessment.worker_name || 'Unknown'}</p>
      <p><strong>Document:</strong> ${documentType}</p>
      <p><strong>Assessment Type:</strong> ${complianceType}</p>
      <p><strong>Status:</strong> ${assessment.compliance_status || 'Unknown'}</p>
      <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
      <hr>
      <div>${assessment.professional_assessment || 'No details available'}</div>
    ` : '';
    try {
      const response = await fetch('/api/send-report-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail || prompt('Enter email address:') || 'compliance@company.com',
          subject: `${documentType} ${complianceType} Report - ${assessment?.worker_name || 'Unknown'}`,
          html: emailHTML,
          workerName: assessment?.worker_name || 'Unknown',
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email');
      }
      alert('Report sent successfully via email!');
    } catch (error) {
      console.error('❌ Email error:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  // Delete worker and update localStorage
  const handleDeleteWorker = (workerId: string) => {
    if (confirm('Are you sure you want to delete this worker?')) {
      const updatedWorkers = workers.filter((w) => w.id !== workerId);
      setWorkers(updatedWorkers);
      localStorage.setItem(workersKey, JSON.stringify(updatedWorkers));
      // Remove associated assessments
      const updatedAssessments = assessments.filter((a) => a.worker_id !== workerId);
      setAssessments(updatedAssessments);
      localStorage.setItem(assessmentsKey, JSON.stringify(updatedAssessments));
    }
  };

  // View worker report
  const handleViewWorkerReport = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    const assessment = assessments.find(a => a.worker_id === workerId);
    if (worker && assessment) {
      setSelectedWorkerAssessment(assessment);
      setActiveTab('assessment');
    }
  };

  // Help with breach
  const handleHelpWithBreach = (workerName: string) => {
    const helpMessage = `I can help you with compliance issues for ${workerName}. What specific breach are you dealing with?`;
    setChatMessages(prev => [...prev, {
      role: 'assistant',
      content: helpMessage,
      timestamp: new Date().toISOString()
    }]);
    setActiveTab('ai-assistant');
  };

  // Upload handler
  const handleUpload = async () => {
    if (!selectedFiles.length) {
      alert('Please select files to upload.');
      return;
    }
    if (!service) {
      alert('Service not available. Please try again.');
      return;
    }

    setUploading(true);
    try {
      const result = await service.uploadDocuments(selectedFiles, agentKey);
      if (result.worker) {
        setWorkers(prev => [...prev, result.worker!]);
      }
      if (result.assessment) {
        setAssessments(prev => [...prev, result.assessment!]);
        setCurrentAssessment(result.assessment);
      }
      setSelectedFiles([]);
      alert('Upload successful!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Print report
  const handlePrintReport = () => {
    if (!currentAssessment && !selectedWorkerAssessment) {
      alert('No assessment report available to print.');
      return;
    }
    window.print();
  };

  // Chat send handler
  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      role: 'user' as const,
      content: chatInput,
      timestamp: new Date().toISOString(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      // Simulate AI response
      const aiResponse = {
        role: 'assistant' as const,
        content: `I understand your question about "${chatInput}". Let me help you with that. This is a simulated response from the AI assistant.`,
        timestamp: new Date().toISOString(),
      };

      setTimeout(() => {
        setChatMessages(prev => [...prev, aiResponse]);
        setChatLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Chat error:', error);
      setChatLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading compliance dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication prompt
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-4">
                Please sign in to access the AI Compliance Dashboard and manage your workers and assessments.
              </p>
              <Button 
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => window.location.href = '/auth/signin'}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-dark mb-2 flex items-center gap-3">
          <Bot className="h-8 w-8 text-brand-light" />
          {agentConfig.title}
        </h1>
        <p className="text-gray-600">{agentConfig.description}</p>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger 
            value="dashboard" 
            className="flex items-center gap-2"
            activeTab={activeTab}
            onValueChange={setActiveTab}
          >
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger 
            value="workers" 
            className="flex items-center gap-2"
            activeTab={activeTab}
            onValueChange={setActiveTab}
          >
            <Users className="h-4 w-4" />
            Workers
          </TabsTrigger>
          <TabsTrigger 
            value="assessment" 
            className="flex items-center gap-2"
            activeTab={activeTab}
            onValueChange={setActiveTab}
          >
            <FileText className="h-4 w-4" />
            Assessment
          </TabsTrigger>
          <TabsTrigger 
            value="ai-assistant" 
            className="flex items-center gap-2"
            activeTab={activeTab}
            onValueChange={setActiveTab}
          >
            <MessageSquare className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" activeTab={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Workers
                </CardTitle>
                <Users className="h-4 w-4 text-brand-light" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-brand-dark">
                  {dashboardStats.totalWorkers}
                </div>
                <p className="text-xs text-gray-600">Active workers</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Compliance Rate
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-brand-dark">
                  {dashboardStats.complianceRate}%
                </div>
                <p className="text-xs text-gray-600">
                  {dashboardStats.compliantWorkers} compliant workers
                </p>
              </CardContent>
            </Card>
            
            <Card
              className={
                dashboardStats.redFlags > 0
                  ? "border-red-500 border-2 animate-pulse"
                  : ""
              }
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  🚨 Red Flags
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {dashboardStats.redFlags}
                </div>
                <p className="text-xs text-red-600">
                  Immediate attention required
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-brand-dark">
                  {dashboardStats.highRisk}
                </div>
                <p className="text-xs text-gray-600">High risk workers</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-brand-dark flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Compliance Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PieChartComponent data={pieChartData} />
                <div className="flex justify-center space-x-4 mt-4">
                  {pieChartData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-brand-dark flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Risk Level Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChartComponent data={barChartData} />
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-brand-dark">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {workers
                .slice(-3)
                .reverse()
                .map((worker, index) => (
                <div key={worker.id} className="flex items-center space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full ${worker.red_flag ? "bg-red-500 animate-pulse" : worker.compliance_status === "COMPLIANT" ? "bg-green-500" : "bg-yellow-500"}`}
                    ></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                        {worker.red_flag
                          ? `Red flag detected for ${worker.name}`
                          : worker.compliance_status === "COMPLIANT"
                            ? `${worker.name} assessment completed`
                            : `${worker.name} requires review`}
                    </p>
                    <p className="text-xs text-gray-500">
                        {worker.red_flag
                          ? agentKey === "ai-right-to-work-compliance"
                            ? `${worker.job_title} - RTW verification failed`
                            : `${worker.job_title} without qualifications`
                          : worker.compliance_status === "COMPLIANT"
                            ? agentKey === "ai-right-to-work-compliance"
                              ? "RTW status confirmed"
                              : "Compliant status confirmed"
                            : agentKey === "ai-right-to-work-compliance"
                              ? "Missing RTW documents"
                              : "Missing training certificates"}{" "}
                        - {worker.last_assessment_date}
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
                <CardTitle className="text-brand-dark flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Workers
                </CardTitle>
                <p className="text-gray-600 text-sm mt-1">
                  {agentKey === "ai-right-to-work-compliance"
                    ? "Manage sponsored workers and their right to work status"
                    : agentKey === "ai-salary-compliance"
                      ? "Manage sponsored workers and their salary compliance"
                      : "Manage sponsored workers and their qualifications"}
                </p>
              </div>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Worker
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-900 text-white">
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">
                        CoS Reference
                      </th>
                      <th className="text-left p-4 font-medium">Job Title</th>
                      <th className="text-left p-4 font-medium">SOC Code</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Risk Level</th>
                      <th className="text-left p-4 font-medium">
                        View Compliance Report
                      </th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.map((worker) => {
                      console.log('DISPLAY WORKER NAME:', worker);
                      return (
                        <tr
                          key={worker.id}
                          className={`border-b ${worker.red_flag ? "bg-red-50" : ""}`}
                        >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {worker.name}
                              {worker.red_flag && (
                                <span className="text-red-500 text-xs animate-pulse">
                                  🚨
                                </span>
                            )}
                          </div>
                        </td>
                          <td className="p-4">{worker.cos_reference}</td>
                          <td className="p-4">{worker.job_title}</td>
                          <td className="p-4">{worker.soc_code}</td>
                          <td className="p-4">
                            {getStatusBadge(
                              worker.compliance_status,
                              worker.red_flag,
                            )}
                          </td>
                          <td className="p-4">
                            {getRiskBadge(worker.risk_level)}
                          </td>
                        <td className="p-4">
                          <Button 
                            size="sm" 
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                            onClick={() => handleViewWorkerReport(worker.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Report
                          </Button>
                        </td>
                        <td className="p-4">
                          <Button 
                            size="sm" 
                            className="bg-green-500 hover:bg-green-600 text-white"
                            onClick={() => handleHelpWithBreach(worker.name)}
                          >
                            <HelpCircle className="h-4 w-4 mr-1" />
                            Help with Breach
                          </Button>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessment Tab */}
        <TabsContent value="assessment" activeTab={activeTab}>
          <div className="space-y-6">
            <AgentAssessmentExplainer />
            <Card>
              <CardHeader>
                <CardTitle className="text-brand-dark flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Document Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Upload Compliance Documents
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {agentKey === "ai-right-to-work-compliance"
                      ? "Upload CoS certificate, passport, biometric residence permit, and RTW documents for AI analysis"
                      : agentKey === "ai-salary-compliance"
                        ? "Upload CoS certificate, payslips, salary documents, and employment contracts for AI analysis"
                        : "Upload CoS certificate, CV, qualification documents, and application forms for AI analysis"}
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <Button 
                    className="bg-brand-light hover:bg-brand-light text-white mb-4"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose Files
                  </Button>
                  
                  {selectedFiles.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Selected Files:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {selectedFiles.map((file, index) => (
                          <li
                            key={index}
                            className="flex items-center justify-center gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            {file.name}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="bg-green-500 hover:bg-green-600 text-white mt-4"
                        onClick={handleUpload}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            AI Processing...
                          </>
                        ) : (
                          <>
                            <Bot className="h-4 w-4 mr-2" />
                            Analyze Documents
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Assessment Results */}
            {(currentAssessment || selectedWorkerAssessment) && (
              <Card
                className={
                  currentAssessment?.red_flag ||
                  selectedWorkerAssessment?.red_flag
                    ? "border-red-500 border-2"
                    : ""
                }
              >
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <FileText className="h-6 w-6 text-gray-600 mr-2" />
                    <CardTitle className="text-brand-dark">
                      Compliance Analysis Report
                    </CardTitle>
                  </div>
                  <p className="text-sm text-gray-600">
                    Generated on{" "}
                    {new Date(
                      (currentAssessment || selectedWorkerAssessment)
                        ?.generated_at || "",
                    ).toLocaleDateString("en-GB")}{" "}
                    {new Date(
                      (currentAssessment || selectedWorkerAssessment)
                        ?.generated_at || "",
                    ).toLocaleTimeString("en-GB", { hour12: false })}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Serious Breach Alert */}
                  {(currentAssessment?.red_flag ||
                    selectedWorkerAssessment?.red_flag) && (
                    <div className="bg-red-500 text-white p-4 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-bold">
                          SERIOUS BREACH DETECTED
                        </span>
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <p>
                        {agentKey === "ai-right-to-work-compliance"
                          ? "Right to work verification failed - Immediate review required"
                          : agentKey === "ai-salary-compliance"
                            ? "Salary compliance breach detected - Immediate review required"
                            : "Qualification requirements not met - Immediate review required"}
                      </p>
                    </div>
                  )}

                  {/* Professional Assessment */}
                  <div className="border-l-4 border-blue-300 bg-blue-50 p-6">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                      {
                        (currentAssessment || selectedWorkerAssessment)
                          ?.professional_assessment
                      }
                    </div>
                  </div>

                  {/* Assessment Summary */}
                  <div>
                    <h4 className="font-medium mb-3 text-brand-dark flex items-center gap-2">
                      <FileCheck className="h-4 w-4" />
                      Assessment Summary
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <label className="text-gray-600 font-medium">
                          Worker:
                        </label>
                        <p>
                          {
                            (currentAssessment || selectedWorkerAssessment)
                              ?.worker_name
                          }
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-600 font-medium">
                          CoS Reference:
                        </label>
                        <p>
                          {
                            (currentAssessment || selectedWorkerAssessment)
                              ?.cos_reference
                          }
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-600 font-medium">
                          Job Title:
                        </label>
                        <p>
                          {
                            (currentAssessment || selectedWorkerAssessment)
                              ?.job_title
                          }
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-600 font-medium">
                          SOC Code:
                        </label>
                        <p>
                          {
                            (currentAssessment || selectedWorkerAssessment)
                              ?.soc_code
                          }
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-600 font-medium">
                          Assignment Date:
                        </label>
                        <p>
                          {
                            (currentAssessment || selectedWorkerAssessment)
                              ?.assignment_date
                          }
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-600 font-medium">
                          Status:
                        </label>
                        <div className="mt-1">
                          {getStatusBadge(
                            (currentAssessment || selectedWorkerAssessment)
                              ?.compliance_status || "",
                            (currentAssessment || selectedWorkerAssessment)
                              ?.red_flag,
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Report Options */}
                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4 text-brand-dark flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Report Options
                    </h4>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Button 
                        className="bg-red-500 hover:bg-red-600 text-white"
                        onClick={handleDownloadPDF}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button 
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={handleEmailReport}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email Report
                      </Button>
                      <Button 
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={handlePrintReport}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print Report
                      </Button>
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
              <CardTitle className="text-brand-dark flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Compliance Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-96 border rounded-lg p-4 bg-gray-50 overflow-y-auto">
                  <div className="space-y-3">
                    {chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.role === "user"
                              ? "bg-brand-dark text-white"
                              : "bg-white shadow-sm border"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-dark"></div>
                            <span className="text-sm">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ask about compliance requirements, SOC codes, Care Certificates..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleChatSend()}
                    disabled={chatLoading}
                  />
                  <Button 
                    className="bg-brand-dark hover:bg-brand-light text-white"
                    onClick={handleChatSend}
                    disabled={chatLoading || !chatInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
