export const dynamic = 'force-dynamic'

import AIComplianceDashboard from '@/components/AIComplianceDashboard';

export default function AIRightToRentCompliancePage() {
  return (
    <AIComplianceDashboard 
      title="AI Right to Rent Compliance System"
      description="AI-powered right to rent verification and compliance analysis"
      storagePrefix="rightToRent"
      documentType="Right to Rent Document"
      complianceType="Right to Rent Compliance"
    />
  );
} 