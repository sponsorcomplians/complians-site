'use client'

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import AIComplianceDashboard from '@/components/AIComplianceDashboard'

function RecruitmentPracticesComplianceContent() {
  return <AIComplianceDashboard />
}

export default function AIRecruitmentPracticesCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecruitmentPracticesComplianceContent />
    </Suspense>
  )
}
