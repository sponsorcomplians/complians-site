'use client'

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import GenuineVacanciesComplianceDashboard from '@/components/GenuineVacanciesComplianceDashboard'

function GenuineVacanciesComplianceContent() {
  return <GenuineVacanciesComplianceDashboard />
}

export default function AIGenuineVacanciesCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GenuineVacanciesComplianceContent />
    </Suspense>
  )
} 