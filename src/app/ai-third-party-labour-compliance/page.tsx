"use client"

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import AgentAssessmentExplainer from '@/components/AgentAssessmentExplainer'
import ThirdPartyLabourComplianceDashboard from '@/components/ThirdPartyLabourComplianceDashboard'

function ThirdPartyLabourComplianceContent() {
  return (
    <>
      <AgentAssessmentExplainer />
      <ThirdPartyLabourComplianceDashboard />
    </>
  )
}

export default function AIThirdPartyLabourCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ThirdPartyLabourComplianceContent />
    </Suspense>
  )
} 