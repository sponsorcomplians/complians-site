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
  complianceStatus: "COMPLIANT" | "NOT_QUALIFIED" | "SERIOUS_BREACH";
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
  complianceStatus: "COMPLIANT" | "NOT_QUALIFIED" | "SERIOUS_BREACH";
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

// Main component
export default function QualificationComplianceDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<QualificationAssessment | null>(null);
  const [selectedWorkerAssessment, setSelectedWorkerAssessment] = useState<QualificationAssessment | null>(null);
  const [workers, setWorkers] = useState<QualificationWorker[]>([]);
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

  // Dashboard stats
  const dashboardStats = {
    totalWorkers: workers.length,
    compliantWorkers: workers.filter(w => w.complianceStatus === 'COMPLIANT').length,
    redFlags: workers.filter(w => w.redFlag).length,
    notQualified: workers.filter(w => w.complianceStatus === 'NOT_QUALIFIED' || w.complianceStatus === 'SERIOUS_BREACH').length,
    complianceRate: workers.length > 0 ? Math.round((workers.filter(w => w.complianceStatus === 'COMPLIANT').length / workers.length) * 100) : 0,
  };

  // Chart data
  const pieChartData = [
    { name: 'Compliant', value: workers.filter(w => w.complianceStatus === 'COMPLIANT').length, color: '#10B981' },
    { name: 'Not Qualified', value: workers.filter(w => w.complianceStatus === 'NOT_QUALIFIED').length, color: '#F59E0B' },
    { name: 'Serious Breach', value: workers.filter(w => w.complianceStatus === 'SERIOUS_BREACH').length, color: '#EF4444' }
  ];

  // File select handler
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  // Extract qualification info from files (mock)
  const extractQualificationInfo = (files: File[]) => {
    // This is a placeholder for real extraction logic
    let workerName = 'Unknown Worker';
    let cosReference = 'UNKNOWN';
    let qualification = 'Unknown Qualification';
    let socCode = '0000';
    let jobTitle = 'Unknown';
    if (files.length > 0) {
      workerName = files[0].name.split('-')[0] || workerName;
      qualification = files[0].name.split('-')[1] || qualification;
      cosReference = 'COS' + Math.floor(100000 + Math.random() * 900000);
      socCode = '6145';
      jobTitle = 'Care Assistant';
    }
    return { workerName, cosReference, qualification, socCode, jobTitle };
  };

  // Generate assessment (mock)
  const generateProfessionalAssessment = (workerName: string, qualification: string, socCode: string) => {
    return `${workerName} holds the qualification: ${qualification}.\n\nSOC Code: ${socCode}.\n\nThis assessment confirms the worker meets the qualification requirements for the assigned SOC code.\n\nNo compliance breaches detected.`;
  };

  // Upload handler
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one qualification document to upload.');
      return;
    }
    setUploading(true);
    setTimeout(() => {
      const { workerName, cosReference, qualification, socCode, jobTitle } = extractQualificationInfo(selectedFiles);
      const complianceStatus: 'COMPLIANT' | 'NOT_QUALIFIED' | 'SERIOUS_BREACH' = qualification !== 'Unknown Qualification' ? 'COMPLIANT' : 'NOT_QUALIFIED';
      const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = complianceStatus === 'COMPLIANT' ? 'LOW' : 'HIGH';
      const redFlag = complianceStatus === 'SERIOUS_BREACH';
      const assignmentDate = new Date().toISOString().split('T')[0];
      const professionalAssessment = generateProfessionalAssessment(workerName, qualification, socCode);
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
        generatedAt: new Date().toISOString(),
      };
      const newWorker: QualificationWorker = {
        id: mockAssessment.workerId,
        name: workerName,
        jobTitle,
        socCode,
        cosReference,
        complianceStatus,
        riskLevel,
        lastAssessment: assignmentDate,
        redFlag,
        assignmentDate,
        qualification,
      };
      setWorkers(prev => [...prev, newWorker]);
      setAssessments(prev => [...prev, mockAssessment]);
      setCurrentAssessment(mockAssessment);
      setUploading(false);
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 2000);
  };

  // Chat send handler
  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [
      ...prev,
      { role: 'user', content: chatInput, timestamp: new Date().toISOString() },
      { role: 'assistant', content: 'Thank you for your question. Our AI will review your query and provide guidance on qualification compliance.', timestamp: new Date().toISOString() },
    ]);
    setChatInput('');
  };

  // Delete worker
  const handleDeleteWorker = (workerId: string) => {
    if (confirm('Are you sure you want to delete this worker?')) {
      const updatedWorkers = workers.filter(w => w.id !== workerId);
      setWorkers(updatedWorkers);
      const updatedAssessments = assessments.filter(a => a.workerId !== workerId);
      setAssessments(updatedAssessments);
    }
  };

  // View worker report
  const handleViewWorkerReport = (workerId: string) => {
    const workerAssessment = assessments.find(a => a.workerId === workerId);
    if (workerAssessment) {
      setSelectedWorkerAssessment(workerAssessment);
      setActiveTab('assessment');
    }
  };

  // PDF download (mock)
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
      doc.text('Qualification Compliance Analysis Report', 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`, 105, 30, { align: 'center' });
      let yPos = 50;
      doc.setFontSize(14);
      doc.text('Assessment Summary', 10, yPos); yPos += 10;
      doc.setFontSize(10);
      doc.text(`Worker: ${assessment.workerName}`, 10, yPos); yPos += 7;
      doc.text(`CoS Reference: ${assessment.cosReference}`, 10, yPos); yPos += 7;
      doc.text(`Job Title: ${assessment.jobTitle}`, 10, yPos); yPos += 7;
      doc.text(`Qualification: ${assessment.qualification}`, 10, yPos); yPos += 7;
      doc.text(`SOC Code: ${assessment.socCode}`, 10, yPos); yPos += 7;
      doc.text(`Status: ${assessment.complianceStatus}`, 10, yPos); yPos += 15;
      doc.setFontSize(14);
      doc.text('Professional Assessment', 10, yPos); yPos += 10;
      doc.setFontSize(9);
      const assessmentLines = doc.splitTextToSize(assessment.professionalAssessment || '', 180);
      assessmentLines.forEach((line: string) => { if (yPos > 270) { doc.addPage(); yPos = 20; } doc.text(line, 10, yPos); yPos += 5; });
      doc.save(`Qualification_Compliance_Report_${assessment.workerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Email report (mock)
  const handleEmailReport = async () => {
    if (!currentAssessment && !selectedWorkerAssessment) {
      alert('No assessment report available to email.');
      return;
    }
    const assessment = currentAssessment || selectedWorkerAssessment;
    const subject = `Qualification Compliance Assessment Report - ${assessment.workerName}`;
    const body = `Please find the qualification compliance assessment report for ${assessment.workerName} (${assessment.cosReference}).\n\nQualification: ${assessment.qualification}\nSOC Code: ${assessment.socCode}\nStatus: ${assessment.complianceStatus}\nGenerated: ${new Date().toLocaleDateString('en-GB')}\n\n${assessment.professionalAssessment}\n\n---\nThis report was generated by the AI Qualification Compliance System.`;
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
    alert('Email service not configured. Opening your email client instead.');
  };

  // Print report
  const handlePrintReport = () => {
    if (!currentAssessment && !selectedWorkerAssessment) {
      alert('No assessment report available to print.');
      return;
    }
    window.print();
  };

  // LocalStorage persistence
  useEffect(() => {
    const savedWorkers = localStorage.getItem('qualificationComplianceWorkers');
    if (savedWorkers) {
      try { setWorkers(JSON.parse(savedWorkers)); } catch (error) { console.error('Error loading saved workers:', error); }
    }
  }, []);
  useEffect(() => {
    if (workers.length > 0) {
      localStorage.setItem('qualificationComplianceWorkers', JSON.stringify(workers));
    }
  }, [workers]);
  useEffect(() => {
    const savedAssessments = localStorage.getItem('qualificationComplianceAssessments');
    if (savedAssessments) {
      try { setAssessments(JSON.parse(savedAssessments)); } catch (error) { console.error('Error loading saved assessments:', error); }
    }
  }, []);
  useEffect(() => {
    if (assessments.length > 0) {
      localStorage.setItem('qualificationComplianceAssessments', JSON.stringify(assessments));
    }
  }, [assessments]);

  // Debug logging
  useEffect(() => {
    console.log('Qualification Dashboard Debug:', {
      activeTab,
      workers,
      assessments,
      currentAssessment,
      selectedWorkerAssessment,
    });
  }, [activeTab, workers, assessments, currentAssessment, selectedWorkerAssessment]);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
          </div>
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
                        <td className="p-4">{worker.complianceStatus}</td>
                        <td className="p-4">{worker.riskLevel}</td>
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
                      <h4 className="font-medium mb-2">Selected Files:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {selectedFiles.map((file, index) => (
                          <li key={index} className="flex items-center justify-center gap-2">
                            <FileText className="h-4 w-4" /> {file.name}
                          </li>
                        ))}
                      </ul>
                      <Button className="bg-green-500 hover:bg-green-600 text-white mt-4" onClick={handleUpload} disabled={uploading}>
                        {uploading ? (<><Clock className="h-4 w-4 mr-2 animate-spin" /> AI Processing...</>) : (<><GraduationCap className="h-4 w-4 mr-2" /> Analyze Qualifications</>)}
                      </Button>
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
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{(currentAssessment || selectedWorkerAssessment)?.professionalAssessment}</div>
                  </div>
                  {/* Assessment Summary */}
                  <div>
                    <h4 className="font-medium mb-3 text-[#263976] flex items-center gap-2"><FileCheck className="h-4 w-4" /> Assessment Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div><label className="text-gray-600 font-medium">Worker:</label><p>{(currentAssessment || selectedWorkerAssessment)?.workerName}</p></div>
                      <div><label className="text-gray-600 font-medium">CoS Reference:</label><p>{(currentAssessment || selectedWorkerAssessment)?.cosReference}</p></div>
                      <div><label className="text-gray-600 font-medium">Job Title:</label><p>{(currentAssessment || selectedWorkerAssessment)?.jobTitle}</p></div>
                      <div><label className="text-gray-600 font-medium">Qualification:</label><p>{(currentAssessment || selectedWorkerAssessment)?.qualification}</p></div>
                      <div><label className="text-gray-600 font-medium">SOC Code:</label><p>{(currentAssessment || selectedWorkerAssessment)?.socCode}</p></div>
                      <div><label className="text-gray-600 font-medium">Status:</label><p>{(currentAssessment || selectedWorkerAssessment)?.complianceStatus}</p></div>
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