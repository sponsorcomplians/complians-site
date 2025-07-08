"use client";
import { Suspense } from 'react';
import AgentAssessmentExplainer from '@/components/AgentAssessmentExplainer';
import SkillsExperienceComplianceDashboard from '@/components/SkillsExperienceComplianceDashboard';

export default function AISkillsExperienceCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AgentAssessmentExplainer />
      <SkillsExperienceComplianceDashboard />
    </Suspense>
  );
} 