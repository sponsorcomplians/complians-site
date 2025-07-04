'use client'

export const dynamic = 'force-dynamic'

import AIComplianceDashboard from '@/components/AIComplianceDashboard';

function ReportingDutiesComplianceContent() {
  return <AIComplianceDashboard />;
}

export default function AIReportingDutiesCompliancePage() {
  return (
    <AIComplianceDashboard 
      title="AI Reporting Duties System"
      description="AI-powered sponsor reporting and compliance monitoring"
      storagePrefix="reporting"
      documentType="Report Document"
      complianceType="Reporting Compliance"
    />
  );
}
