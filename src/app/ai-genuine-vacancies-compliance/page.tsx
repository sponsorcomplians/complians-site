export const dynamic = 'force-dynamic'

'use client'

import { Suspense } from 'react'
import AIComplianceDashboard from '@/components/AIComplianceDashboard'

function GenuineVacanciesComplianceContent() {
  return <AIComplianceDashboard />
}

export default function AIGenuineVacanciesCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GenuineVacanciesComplianceContent />
    </Suspense>
  )
} 