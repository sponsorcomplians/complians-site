'use client'

export const dynamic = 'force-dynamic'

import MigrantTrackingComplianceDashboard from '@/components/MigrantTrackingComplianceDashboard'

export default function MigrantTrackingCompliancePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MigrantTrackingComplianceDashboard />
    </div>
  )
}
