'use client'

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import RecruitmentPracticesComplianceDashboard from '@/components/RecruitmentPracticesComplianceDashboard'

export default function AIRecruitmentPracticesCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecruitmentPracticesComplianceDashboard />
    </Suspense>
  )
}
