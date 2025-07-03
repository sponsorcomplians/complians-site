'use client'

import { Suspense } from 'react'
import AIComplianceDashboard from '@/components/AIComplianceDashboard'

function RecordKeepingComplianceContent() {
  return <AIComplianceDashboard />
}

export default function AIRecordKeepingCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecordKeepingComplianceContent />
    </Suspense>
  )
}
