"use client";

import { Suspense } from 'react'
import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
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
  GraduationCap
} from 'lucide-react'
import AgentAssessmentExplainer from "../../components/AgentAssessmentExplainer"
import PaymentGate from "../../components/PaymentGate"

// Custom Card Components
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
)

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
)

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
)

export default function AIQualificationCompliancePage() {
  return (
    <PaymentGate 
      productId="ai-qualification-compliance"
      productName="AI Qualification Compliance Agent"
    >
      <AIQualificationComplianceContent />
    </PaymentGate>
  )
}

function AIQualificationComplianceContent() {
  return <QualificationComplianceDashboard />;
}

