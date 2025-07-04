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
  Calendar,
} from "lucide-react";
import AgentAssessmentExplainer from "./AgentAssessmentExplainer";

// Types for our data structures
interface RightToWorkWorker {
  id: string;
  name: string;
  jobTitle: string;
  socCode: string;
  documentType: string;
  complianceStatus: "COMPLIANT" | "SERIOUS BREACH";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  lastAssessment: string;
  redFlag: boolean;
  assignmentDate: string;
  documentExpiry: string;
}

interface RightToWorkAssessment {
  id: string;
  workerId: string;
  workerName: string;
  documentType: string;
  jobTitle: string;
  socCode: string;
  complianceStatus: "COMPLIANT" | "SERIOUS BREACH";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  redFlag: boolean;
  assignmentDate: string;
  documentExpiry: string;
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
export default function RightToWorkComplianceDashboard() {
  // Placeholder UI for now
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-[#263976] mb-2 flex items-center gap-3">
        <CheckCircle className="h-8 w-8 text-[#00c3ff]" />
        AI Right to Work Compliance System
      </h1>
      <p className="text-gray-600 mb-8">
        AI-powered right to work verification and compliance analysis (full dashboard coming soon)
      </p>
      {/* The full dashboard will be implemented here following the QualificationComplianceDashboard model */}
    </div>
  );
} 