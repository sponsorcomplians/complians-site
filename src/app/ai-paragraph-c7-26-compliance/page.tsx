"use client";

import { Suspense } from 'react';
import ParagraphC726ComplianceDashboard from '@/components/ParagraphC726ComplianceDashboard';

export const dynamic = 'force-dynamic'

export default function ParagraphC726CompliancePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div>Loading...</div>}>
        <ParagraphC726ComplianceDashboard />
      </Suspense>
    </div>
  );
}
