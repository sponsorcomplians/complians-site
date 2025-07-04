export const dynamic = 'force-dynamic'

"use client";

import { Suspense } from "react";
import AIComplianceDashboard from "@/components/AIComplianceDashboard";

function ContractedHoursComplianceContent() {
  return <AIComplianceDashboard />;
}

export default function AIContractedHoursCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ContractedHoursComplianceContent />
    </Suspense>
  );
}
