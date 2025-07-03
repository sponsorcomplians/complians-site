"use client";

import { Suspense } from "react";
import AIComplianceDashboard from "@/components/AIComplianceDashboard";

function ParagraphC726ComplianceContent() {
  return <AIComplianceDashboard />;
}

export default function AIParagraphC726CompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ParagraphC726ComplianceContent />
    </Suspense>
  );
}
