"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MasterComplianceSummaryCardProps {
  summary: {
    totalWorkers: number;
    totalAssessments: number;
    overallComplianceRate: number;
    totalBreaches: number;
    totalSeriousBreaches: number;
    totalRedFlags: number;
    highRiskWorkers: number;
  };
  className?: string;
}

export default function MasterComplianceSummaryCard({ 
  summary, 
  className = "" 
}: MasterComplianceSummaryCardProps) {
  const getComplianceRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceRateBadge = (rate: number) => {
    if (rate >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (rate >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <TooltipProvider>
      <Card className={`${className}`}>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Workers */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-brand-light mr-2" />
                <span className="text-sm font-medium text-gray-600">Total Workers</span>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400 ml-1" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total number of sponsored workers across all 15 compliance areas</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-2xl font-bold text-brand-dark">{summary.totalWorkers}</div>
            </div>

            {/* Compliance Rate */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm font-medium text-gray-600">Compliance Rate</span>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400 ml-1" />
                  </TooltipTrigger>
                                  <TooltipContent>
                  <p>Percentage of all sponsored workers assessed as fully compliant across all 15 AI compliance areas. Calculated using the strictest risk criteria for each worker.</p>
                </TooltipContent>
                </Tooltip>
              </div>
              <div className={`text-2xl font-bold ${getComplianceRateColor(summary.overallComplianceRate)}`}>
                {summary.overallComplianceRate}%
              </div>
              <Badge className={`mt-1 ${getComplianceRateBadge(summary.overallComplianceRate)}`}>
                {summary.overallComplianceRate >= 80 ? 'Good' : summary.overallComplianceRate >= 60 ? 'Fair' : 'Poor'}
              </Badge>
            </div>

            {/* Red Flags */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm font-medium text-gray-600">Red Flags</span>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400 ml-1" />
                  </TooltipTrigger>
                                  <TooltipContent>
                  <p>Number of workers identified as serious compliance breaches requiring immediate review and remedial action under sponsor guidance.</p>
                </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-2xl font-bold text-red-600">{summary.totalRedFlags}</div>
              {summary.totalRedFlags > 0 && (
                <Badge className="mt-1 bg-red-100 text-red-800 border-red-200">
                  Critical
                </Badge>
              )}
            </div>

            {/* High Risk Workers */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-sm font-medium text-gray-600">High Risk</span>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400 ml-1" />
                  </TooltipTrigger>
                                  <TooltipContent>
                  <p>Overall distribution of compliance risk levels (Low, Medium, High) across your entire workforce and all compliance areas.</p>
                </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{summary.highRiskWorkers}</div>
              {summary.highRiskWorkers > 0 && (
                <Badge className="mt-1 bg-yellow-100 text-yellow-800 border-yellow-200">
                  Monitor
                </Badge>
              )}
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Total Assessments</div>
              <div className="text-lg font-semibold text-brand-dark">{summary.totalAssessments}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <span className="text-sm text-gray-600">Breaches</span>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-gray-400 ml-1" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total number of detected compliance failures or breaches across all assessments. Includes both serious and minor breaches.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-lg font-semibold text-yellow-600">{summary.totalBreaches}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Serious Breaches</div>
              <div className="text-lg font-semibold text-red-600">{summary.totalSeriousBreaches}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
} 