"use client"

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import AgentAssessmentExplainer from '@/components/AgentAssessmentExplainer'
import ReportingDutiesComplianceDashboard from '@/components/ReportingDutiesComplianceDashboard'

function ReportingDutiesComplianceContent() {
  return (
    <>
      <AgentAssessmentExplainer />
      <ReportingDutiesComplianceDashboard />
    </>
  )
}

export default function AIReportingDutiesCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportingDutiesComplianceContent />
    </Suspense>
  )
}
