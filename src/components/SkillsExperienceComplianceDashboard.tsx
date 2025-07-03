"use client";

import { useState } from 'react';
import {
  Users,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  PieChart,
  BarChart3,
  FileText,
  MessageSquare,
  Upload,
  Plus,
  Eye,
  Send,
  Bot,
} from 'lucide-react';
import AgentAssessmentExplainer from './AgentAssessmentExplainer';
import { useSearchParams } from 'next/navigation';

// Sample data for demonstration
const sampleWorkers = [
  {
    id: 1,
    name: 'John Smith',
    jobTitle: 'Software Developer',
    socCode: '2136',
    complianceStatus: 'COMPLIANT',
    riskLevel: 'LOW',
    lastAssessment: '2024-06-10',
    redFlag: false,
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    jobTitle: 'Care Assistant',
    socCode: '6145',
    complianceStatus: 'SERIOUS BREACH',
    riskLevel: 'HIGH',
    lastAssessment: '2024-06-09',
    redFlag: true,
  },
  {
    id: 3,
    name: 'Ahmed Hassan',
    jobTitle: 'Senior Care Worker',
    socCode: '6146',
    complianceStatus: 'BREACH',
    riskLevel: 'MEDIUM',
    lastAssessment: '2024-06-08',
    redFlag: false,
  },
];

const complianceStatusColors = {
  COMPLIANT: 'bg-green-500 text-white',
  BREACH: 'bg-yellow-400 text-white',
  'SERIOUS BREACH': 'bg-red-500 text-white',
};

const riskLevelColors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
};

const pieChartData = [
  { name: 'Compliant', value: 1, color: '#22c55e' },
  { name: 'Breach', value: 1, color: '#facc15' },
  { name: 'Serious Breach', value: 1, color: '#ef4444' },
];

const barChartData = [
  { name: 'Low Risk', value: 1 },
  { name: 'Medium Risk', value: 1 },
  { name: 'High Risk', value: 1 },
];

export default function SkillsExperienceComplianceDashboard() {
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I'm your AI compliance assistant. I can help you with questions about skills, experience, CVs, and compliance obligations. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Dashboard stats
  const dashboardStats = {
    totalWorkers: sampleWorkers.length,
    complianceRate: Math.round(
      (sampleWorkers.filter((w) => w.complianceStatus === 'COMPLIANT').length /
        sampleWorkers.length) *
        100
    ),
    compliantWorkers: sampleWorkers.filter(
      (w) => w.complianceStatus === 'COMPLIANT'
    ).length,
    redFlags: sampleWorkers.filter((w) => w.redFlag).length,
    highRisk: sampleWorkers.filter((w) => w.riskLevel === 'HIGH').length,
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

      {/* Tabs */}
      <div className="flex border-b mb-6">
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
                <TrendingUp className="h-6 w-6 text-red-500" />
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
                {sampleWorkers.map((worker) => (
                  <tr
                    key={worker.id}
                    className={
                      worker.redFlag
                        ? 'bg-red-50'
                        : worker.complianceStatus === 'BREACH'
                        ? 'bg-yellow-50'
                        : ''
                    }
                  >
                    <td className="px-4 py-2">{worker.name}</td>
                    <td className="px-4 py-2">{worker.jobTitle}</td>
                    <td className="px-4 py-2">{worker.socCode}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded font-semibold text-xs ${complianceStatusColors[worker.complianceStatus as keyof typeof complianceStatusColors]}`}
                      >
                        {worker.complianceStatus}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded font-semibold text-xs ${riskLevelColors[worker.riskLevel as keyof typeof riskLevelColors]}`}
                      >
                        {worker.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button className="bg-gray-900 text-white px-3 py-1 rounded flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        View Report
                      </button>
                    </td>
                    <td className="px-4 py-2">
                      <button className="bg-green-500 text-white px-3 py-1 rounded flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Help with Breach
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'assessment' && (
        <>
          <AgentAssessmentExplainer />
          <div className="bg-white rounded-lg p-6 shadow border">
            <div className="font-semibold text-brand-dark flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5" />
              Document Assessment
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center">
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <div className="text-xl font-semibold mb-2">
                Upload Compliance Documents
              </div>
              <div className="text-gray-600 mb-4 text-center">
                Upload CV, qualification certificates, experience documents, and application forms for AI analysis
              </div>
              <input
                type="file"
                multiple
                className="hidden"
                id="file-upload"
                onChange={handleFileChange}
              />
              <label
                htmlFor="file-upload"
                className="bg-brand-light text-brand-dark px-6 py-2 rounded cursor-pointer font-medium"
              >
                Choose Files
              </label>
              {uploadedFiles.length > 0 && (
                <div className="mt-4 w-full">
                  <div className="font-medium mb-2">Selected Files:</div>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {uploadedFiles.map((file, idx) => (
                      <li key={idx}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
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