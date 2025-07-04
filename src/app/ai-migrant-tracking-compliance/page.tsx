export const dynamic = 'force-dynamic'

'use client'

import { Suspense } from 'react'
import AIComplianceDashboard from '@/components/AIComplianceDashboard'

function MigrantTrackingComplianceContent() {
  return <AIComplianceDashboard />
}

export default function AIMigrantTrackingCompliancePage() {
  return (
    <AIComplianceDashboard 
      title="AI Migrant Tracking Compliance System"
      description="AI-powered migrant activity tracking and compliance monitoring"
      storagePrefix="migrantTracking"
      documentType="Migrant Tracking Document"
      complianceType="Migrant Tracking Compliance"
    />
  )
}
