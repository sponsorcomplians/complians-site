"use client";

import { Suspense } from 'react';
import AgentAssessmentExplainer from '@/components/AgentAssessmentExplainer';
import RecordKeepingComplianceDashboard from '@/components/RecordKeepingComplianceDashboard';

export default function AIRecordKeepingCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AgentAssessmentExplainer />
      <RecordKeepingComplianceDashboard />
    </Suspense>
  );
}
