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
import { useSearchParams } from 'next/navigation';

// Types for our data structures
interface ParagraphC726Worker {
  id: string;
  name: string;
  jobTitle: string;
  socCode: string;
  complianceStatus: "COMPLIANT" | "SERIOUS_BREACH";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  lastAssessment: string;
  redFlag: boolean;
  assignmentDate: string;
  c726Requirement: string;
  c726Evidence: string;
}

interface ParagraphC726Assessment {
  id: string;
  workerId: string;
  workerName: string;
  jobTitle: string;
  socCode: string;
  c726Requirement: string;
  c726Evidence: string;
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

const riskLevelColors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
};

export default function ParagraphC726ComplianceDashboard() {
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [workers, setWorkers] = useState<ParagraphC726Worker[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hello! I'm your AI compliance assistant. I can help you with questions about Paragraph C7-26 sponsor duties and compliance obligations. How can I assist you today?",
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
  const [assessments, setAssessments] = useState<ParagraphC726Assessment[]>([]);
  const [currentAssessment, setCurrentAssessment] = useState<ParagraphC726Assessment | null>(null);
  const [selectedWorkerAssessment, setSelectedWorkerAssessment] = useState<ParagraphC726Assessment | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');

  // Load workers from localStorage on mount
  useEffect(() => {
    const savedWorkers = localStorage.getItem('paragraphC726DataWorkers');
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
      localStorage.setItem('paragraphC726DataWorkers', JSON.stringify(workers));
    }
  }, [workers]);

  // Load assessments from localStorage on mount
  useEffect(() => {
    const savedAssessments = localStorage.getItem('paragraphC726DataAssessments');
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
      localStorage.setItem('paragraphC726DataAssessments', JSON.stringify(assessments));
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

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
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
  };

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

  // File extraction logic (adapted for contracted hours)
  const extractParagraphC726Info = (files: File[]) => {
    // Simulate extraction logic for contracted hours
    let workerName = "Unknown Worker";
    let jobTitle = "Unknown";
    let socCode = "0000";
    let assignmentDate = "2024-01-01";
    let c726Requirement = "";
    let c726Evidence = "";
    // Extraction logic here (e.g., parse filenames, etc.)
    // ...
    return { workerName, jobTitle, socCode, assignmentDate, c726Requirement, c726Evidence };
  };

  // Assessment logic (adapted)
  const generateParagraphC726Assessment = (
    workerName: string,
    jobTitle: string,
    socCode: string,
    assignmentDate: string,
    c726Requirement: string,
    c726Evidence: string
  ) => {
    // Enhanced assessment logic for contracted hours
    let complianceStatus: "COMPLIANT" | "SERIOUS_BREACH" = "COMPLIANT";
    let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    let redFlag = false;
    
    // Check contracted hours requirements
    const hasC726Requirement = c726Requirement && c726Requirement.length > 0;
    const hasC726Evidence = c726Evidence && c726Evidence.length > 0;
    
    // Determine compliance based on contracted hours
    if (!hasC726Requirement || !hasC726Evidence) {
      complianceStatus = "SERIOUS_BREACH";
      riskLevel = "HIGH";
      redFlag = true;
    }
    
    const professionalAssessment = `You assigned Certificate of Sponsorship (CoS) for ${workerName} on ${assignmentDate} to work as a ${jobTitle} under Standard Occupational Classification (SOC) code ${socCode}.

The summary of job description in the CoS states:

The worker is expected to deliver high-quality care services, provide leadership to junior care staff, participate in care planning and risk assessments, ensure compliance with health and safety standards, and support the operational objectives of the organisation.

The usual requirement for performing such a role is demonstrable evidence of sufficient skills and experience in health and social care (e.g., minimum 2-3 years of relevant experience), and demonstrable evidence of sufficient English language proficiency and previous experience in supervisory or senior care responsibilities.

Upon review of the documentation provided, we acknowledge that ${workerName} has c726Requirement: ${c726Requirement}. ${hasC726Evidence ? `The worker has provided c726Evidence.` : 'c726Evidence has not been provided.'}

${complianceStatus === 'SERIOUS_BREACH' ? 
  `This represents a serious breach of sponsor compliance obligations as the worker is not working the c726Requirement. The Home Office will conclude that you have breached paragraph C7-26 of the Workers and Temporary Workers: Guidance for Sponsors (version 12/24), which clearly states that sponsors must ensure workers work their c726Requirement.` :
  `The worker is working their c726Requirement. Compliance is maintained with Home Office standards.`
}

Compliance Verdict: ${complianceStatus === 'SERIOUS_BREACH' ? 'SERIOUS BREACH — immediate remedial action required' : 'COMPLIANT — continue monitoring c726Requirement'}.`;

    return {
      complianceStatus,
      riskLevel,
      redFlag,
      professionalAssessment
    };
  };

  // Analyze button handler
  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one document to upload.');
      return;
    }
    setUploading(true);
    const extracted = extractParagraphC726Info(selectedFiles);
    setTimeout(() => {
      const assessmentResult = generateParagraphC726Assessment(
        extracted.workerName,
        extracted.jobTitle,
        extracted.socCode,
        extracted.assignmentDate,
        extracted.c726Requirement,
        extracted.c726Evidence
      );
      const newAssessment: ParagraphC726Assessment = {
        id: 'ASSESS_' + Date.now(),
        workerId: 'WORKER_' + Date.now(),
        workerName: extracted.workerName,
        jobTitle: extracted.jobTitle,
        socCode: extracted.socCode,
        c726Requirement: extracted.c726Requirement,
        c726Evidence: extracted.c726Evidence,
        complianceStatus: assessmentResult.complianceStatus,
        riskLevel: assessmentResult.riskLevel,
        redFlag: assessmentResult.redFlag,
        assignmentDate: extracted.assignmentDate,
        professionalAssessment: assessmentResult.professionalAssessment,
        generatedAt: new Date().toISOString()
      };
      // Add worker
      const newWorker: ParagraphC726Worker = {
        id: newAssessment.workerId,
        name: extracted.workerName,
        jobTitle: extracted.jobTitle,
        socCode: extracted.socCode,
        complianceStatus: assessmentResult.complianceStatus,
        riskLevel: assessmentResult.riskLevel,
        lastAssessment: new Date().toISOString().split('T')[0],
        redFlag: assessmentResult.redFlag,
        assignmentDate: extracted.assignmentDate,
        c726Requirement: extracted.c726Requirement,
        c726Evidence: extracted.c726Evidence
      };
      setWorkers(prev => [...prev, newWorker]);
      setAssessments(prev => [...prev, newAssessment]);
      setCurrentAssessment(newAssessment);
      setUploading(false);
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setActiveTab('assessment');
    }, 3000);
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
      doc.text(`c726Requirement: ${assessment?.c726Requirement}`, 10, yPos); yPos += 7;
      doc.text(`c726Evidence: ${assessment?.c726Evidence}`, 10, yPos); yPos += 7;
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
      window.open(mailtoLink);
      alert('Email service not configured. Opening your email client instead.');
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

  // View specific worker report
  const handleViewWorkerReport = (workerId: string) => {
    const workerAssessment = assessments.find(a => a.workerId === workerId);
    if (workerAssessment) {
      setSelectedWorkerAssessment(workerAssessment);
      setActiveTab('assessment');
    } else {
      const worker = workers.find(w => w.id === workerId);
      if (worker) {
        const mockAssessment: ParagraphC726Assessment = {
          id: 'ASSESS_' + Date.now(),
          workerId: worker.id,
          workerName: worker.name,
          jobTitle: worker.jobTitle,
          socCode: worker.socCode,
          c726Requirement: worker.c726Requirement,
          c726Evidence: worker.c726Evidence,
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
    const body = `Dear Complians Support Team,\n\nI need assistance with a skills & experience compliance breach for worker: ${workerName}\n\nPlease provide guidance on:\n- Immediate actions required for skills & experience issues\n- Remedial steps to ensure compliance\n- Documentation needed for Home Office\n- Sponsor licence protection measures\n\nThank you for your assistance.\n\nBest regards`;
    const mailtoLink = `mailto:support@complians.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  // Delete worker
  const handleDeleteWorker = (workerId: string) => {
    if (confirm('Are you sure you want to delete this worker?')) {
      const updatedWorkers = workers.filter(w => w.id !== workerId);
      setWorkers(updatedWorkers);
      localStorage.setItem('paragraphC726DataWorkers', JSON.stringify(updatedWorkers));
      const updatedAssessments = assessments.filter(a => a.workerId !== workerId);
      setAssessments(updatedAssessments);
      localStorage.setItem('paragraphC726DataAssessments', JSON.stringify(updatedAssessments));
    }
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
        <div className="flex items-center gap-3 mb-2">
          <Bot className="h-7 w-7 text-blue-600" />
          <h1 className="text-3xl font-bold text-brand-dark">AI Paragraph C7-26 Compliance Agent</h1>
        </div>
        <p className="text-gray-600 text-lg ml-10">Check compliance with Paragraph C7-26, flag breaches, and guide on sponsor duties.</p>
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
              {/* Bar chart placeholder */}
              <div className="flex items-end justify-around h-48">
                {barChartData.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className="w-8 rounded-t bg-blue-400"
                      style={{ height: `${item.value * 60}px` }}
                    ></div>
                    <span className="text-xs mt-2">{item.name}</span>
                    <span className="text-xs text-gray-500">{item.value}</span>
                  </div>
                ))}
              </div>
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
            <button className="bg-brand-light text-brand-dark px-4 py-2 rounded flex items-center gap-2 font-medium">
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
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.doc" onChange={handleFileSelect} className="hidden" />
              <Button className="bg-black hover:bg-gray-800 text-white mb-4" onClick={() => fileInputRef.current?.click()}>Choose Files</Button>
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
                    <Button className="bg-green-500 hover:bg-green-600 text-white w-full" onClick={handleAnalyze} disabled={uploading || selectedFiles.length === 0}>
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Analyze Skills & Experience ({selectedFiles.length} files)
                    </Button>
                    <Button 
                      className="bg-black hover:bg-gray-800 text-white w-full" 
                      onClick={() => fileInputRef.current?.click()}
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
                      <label className="text-gray-600 font-medium">c726Requirement:</label>
                      <p>{(currentAssessment || selectedWorkerAssessment)?.c726Requirement || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-gray-600 font-medium">c726Evidence:</label>
                      <p>{(currentAssessment || selectedWorkerAssessment)?.c726Evidence || 'N/A'}</p>
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
                    <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleDownloadPDF}>
                      <Download className="h-4 w-4 mr-2" /> Download PDF
                    </Button>
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={handleEmailReport}>
                      <Mail className="h-4 w-4 mr-2" /> Email Report
                    </Button>
                    <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={handlePrintReport}>
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
    </div>
  );
} 