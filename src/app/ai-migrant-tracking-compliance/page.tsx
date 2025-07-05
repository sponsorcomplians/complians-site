'use client'

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import MigrantTrackingComplianceDashboard from '@/components/MigrantTrackingComplianceDashboard'

export default function MigrantTrackingCompliancePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div>Loading...</div>}>
        <MigrantTrackingComplianceDashboard />
      </Suspense>
    </div>
  )
}
