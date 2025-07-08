"use client";

import { GraduationCap } from 'lucide-react';
import AgentAssessmentExplainer from '../../components/AgentAssessmentExplainer';
import QualificationComplianceDashboard from '../../components/QualificationComplianceDashboard';

export default function AIQualificationCompliancePage() {
  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#263976] mb-2 flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-[#00c3ff]" />
          AI Qualification Compliance System
        </h1>
        <p className="text-gray-600">
          AI-powered qualification compliance analysis for UK sponsors with document verification and legal-style reporting
        </p>
      </div>
      {/* Explainer and Documents Side-by-Side */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <AgentAssessmentExplainer />
      </div>
      {/* Main Dashboard */}
      <QualificationComplianceDashboard />
    </div>
  );
}

