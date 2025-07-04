'use client'

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import AIComplianceDashboard from '@/components/AIComplianceDashboard'

function ThirdPartyLabourComplianceContent() {
  return <AIComplianceDashboard />
}

export default function AIThirdPartyLabourCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ThirdPartyLabourComplianceContent />
    </Suspense>
  )
} 