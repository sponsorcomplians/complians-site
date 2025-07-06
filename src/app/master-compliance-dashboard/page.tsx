import { Metadata } from 'next';
import MasterComplianceDashboard from '@/components/MasterComplianceDashboard';

export const metadata: Metadata = {
  title: 'Master Compliance Dashboard | Complians',
  description: 'Unified view of all AI compliance agent assessments and worker status across 15 compliance areas.',
  keywords: 'compliance dashboard, AI agents, worker compliance, sponsor compliance, immigration compliance',
};

export default function MasterComplianceDashboardPage() {
  return <MasterComplianceDashboard />;
} 