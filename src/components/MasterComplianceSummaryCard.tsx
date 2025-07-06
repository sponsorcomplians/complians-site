"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Flag, 
  TrendingUp,
  Clock,
  BarChart3
} from 'lucide-react';
import { MasterComplianceSummary } from '@/types/master-compliance.types';

interface MasterComplianceSummaryCardProps {
  summary: MasterComplianceSummary;
  className?: string;
}

export default function MasterComplianceSummaryCard({ 
  summary, 
  className = "" 
}: MasterComplianceSummaryCardProps) {
  const cards = [
    {
      title: "Total Workers",
      value: summary.totalWorkers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Active workers across all agents"
    },
    {
      title: "Compliance Rate",
      value: `${summary.overallComplianceRate}%`,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Overall compliance percentage"
    },
    {
      title: "Total Breaches",
      value: summary.totalBreaches,
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      description: "Breaches and serious breaches"
    },
    {
      title: "Serious Breaches",
      value: summary.totalSeriousBreaches,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "Critical compliance violations"
    },
    {
      title: "Red Flags",
      value: summary.totalRedFlags,
      icon: Flag,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Workers requiring attention"
    },
    {
      title: "High Risk",
      value: summary.highRiskWorkers,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Workers with high risk level"
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 ${className}`}>
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <IconComponent className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {card.value}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 