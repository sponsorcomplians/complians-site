"use client";
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Dynamically import the dashboard to prevent SSR issues with browser-only APIs
const SkillsExperienceComplianceDashboard = dynamic(
  () => import('@/components/SkillsExperienceComplianceDashboard'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading Skills & Experience Compliance Dashboard...</p>
        </div>
      </div>
    )
  }
);

export default function AISkillsExperienceCompliancePage() {
  return (
    <ErrorBoundary>
      <SkillsExperienceComplianceDashboard />
    </ErrorBoundary>
  );
} 