"use client";

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import AgentAssessmentExplainer from '@/components/AgentAssessmentExplainer'
import RightToWorkComplianceDashboard from '@/components/RightToWorkComplianceDashboard'

// Content component that uses useSearchParams
function RightToWorkComplianceContent() {
  return (
    <>
      <AgentAssessmentExplainer />
      <RightToWorkComplianceDashboard />
    </>
  )
}

// Default export with Suspense wrapper
export default function AIRightToWorkCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RightToWorkComplianceContent />
    </Suspense>
  )
} 