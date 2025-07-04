'use client'

export const dynamic = 'force-dynamic'

import AIComplianceDashboard from '@/components/AIComplianceDashboard'

function RecordKeepingComplianceContent() {
  return <AIComplianceDashboard />
}
  
export default function AIRecordKeepingCompliancePage() {
  return (
    <AIComplianceDashboard 
      title="AI Record Keeping Compliance System"
      description="AI-powered record keeping and document management compliance"
      storagePrefix="recordKeeping"
      documentType="Record Keeping Document"
      complianceType="Record Keeping Compliance"
    />
  )
}
