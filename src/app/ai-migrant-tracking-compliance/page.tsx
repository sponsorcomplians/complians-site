'use client'

import { Suspense } from 'react'
import AIComplianceDashboard from '@/components/AIComplianceDashboard'

function MigrantTrackingComplianceContent() {
  return <AIComplianceDashboard />
}

export default function AIMigrantTrackingCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MigrantTrackingComplianceContent />
    </Suspense>
  )
}
