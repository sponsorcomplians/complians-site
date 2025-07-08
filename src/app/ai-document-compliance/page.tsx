"use client";

import { Suspense } from 'react';
import AgentAssessmentExplainer from '@/components/AgentAssessmentExplainer';
import DocumentComplianceDashboard from '@/components/DocumentComplianceDashboard';

export default function AIDocumentCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AgentAssessmentExplainer />
      <DocumentComplianceDashboard />
    </Suspense>
  );
} 