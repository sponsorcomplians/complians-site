"use client";

import { Suspense } from 'react';
import DocumentComplianceDashboard from '@/components/DocumentComplianceDashboard';

export default function AIDocumentCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DocumentComplianceDashboard />
    </Suspense>
  );
} 