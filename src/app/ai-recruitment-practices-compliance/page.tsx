export const dynamic = 'force-dynamic'

'use client'

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
