"use client";
import { Suspense } from 'react';
import SkillsExperienceComplianceDashboard from '@/components/SkillsExperienceComplianceDashboard';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function AISkillsExperienceCompliancePage() {
  return (
    <ErrorBoundary>
      <SkillsExperienceComplianceDashboard />
    </ErrorBoundary>
  );
} 