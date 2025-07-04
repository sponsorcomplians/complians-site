"use client";

export const dynamic = 'force-dynamic'

import { Suspense } from "react";
import AIComplianceDashboard from "@/components/AIComplianceDashboard";

function MigrantContactMaintenanceContent() {
  return <AIComplianceDashboard />;
}

export default function AIMigrantContactMaintenancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MigrantContactMaintenanceContent />
    </Suspense>
  );
}
