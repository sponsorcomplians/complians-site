"use client";

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import ImmigrationStatusMonitoringDashboard from '@/components/ImmigrationStatusMonitoringDashboard'

function ImmigrationStatusMonitoringContent() {
  return <ImmigrationStatusMonitoringDashboard />
}

export default function AIImmigrationStatusMonitoringPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ImmigrationStatusMonitoringContent />
    </Suspense>
  )
} 