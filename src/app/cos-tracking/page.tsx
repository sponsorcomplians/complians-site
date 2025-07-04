export const dynamic = 'force-dynamic'

import AIComplianceDashboard from '@/components/AIComplianceDashboard';

export default function CoSTrackingPage() {
  return (
    <AIComplianceDashboard 
      title="AI CoS Tracking System"
      description="AI-powered Certificate of Sponsorship tracking and compliance"
      storagePrefix="cosTracking"
      documentType="CoS Document"
      complianceType="CoS Tracking"
    />
  );
} 