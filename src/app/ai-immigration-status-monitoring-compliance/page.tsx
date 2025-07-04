export const dynamic = 'force-dynamic'

"use client";

import { Suspense } from "react";
import AIComplianceDashboard from "@/components/AIComplianceDashboard";

function ImmigrationStatusMonitoringContent() {
  return <AIComplianceDashboard />;
}

export default function AIImmigrationStatusMonitoringPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ImmigrationStatusMonitoringContent />
    </Suspense>
  );
}
