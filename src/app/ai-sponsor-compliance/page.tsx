export const dynamic = 'force-dynamic'

import AIComplianceDashboard from '@/components/AIComplianceDashboard';

export default function AISponsorCompliancePage() {
  return (
    <AIComplianceDashboard 
      title="AI Sponsor Licence Compliance System"
      description="AI-powered sponsor licence compliance and document management"
      storagePrefix="sponsorCompliance"
      documentType="Sponsor Document"
      complianceType="Sponsor Licence Compliance"
    />
  );
} 