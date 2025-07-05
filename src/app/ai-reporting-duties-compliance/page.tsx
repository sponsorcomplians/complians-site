"use client"

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import ReportingDutiesComplianceDashboard from '@/components/ReportingDutiesComplianceDashboard'

function ReportingDutiesComplianceContent() {
  return <ReportingDutiesComplianceDashboard />
}

export default function AIReportingDutiesCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportingDutiesComplianceContent />
    </Suspense>
  )
}
