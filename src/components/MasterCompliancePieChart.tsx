"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface MasterCompliancePieChartProps {
  data: PieChartData[];
  title: string;
  className?: string;
}

export default function MasterCompliancePieChart({ 
  data, 
  title, 
  className = "" 
}: MasterCompliancePieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <TooltipProvider>
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="text-brand-dark flex items-center gap-2">
            {title}
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Visual breakdown showing the proportion of workers who are fully compliant versus those with compliance breaches. Helps identify overall compliance health at a glance.</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 32 32">
                {data.map((item, index) => {
                  const percentage = total > 0 ? (item.value / total) * 100 : 0;
                  const circumference = 2 * Math.PI * 14; // radius = 14
                  const strokeDasharray = circumference;
                  const strokeDashoffset = circumference - (percentage / 100) * circumference;
                  const previousItems = data.slice(0, index);
                  const previousPercentages = previousItems.map(prev => (prev.value / total) * 100);
                  const startAngle = (previousPercentages.reduce((sum, p) => sum + p, 0) / 100) * 360;
                  
                  return (
                    <circle
                      key={item.name}
                      cx="16"
                      cy="16"
                      r="14"
                      fill="none"
                      stroke={item.color}
                      strokeWidth="4"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      style={{
                        transform: `rotate(${startAngle}deg)`,
                        transformOrigin: 'center'
                      }}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-bold text-brand-dark">{total}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            {data.map((item) => {
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
              return (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{item.value}</span>
                    <span className="text-xs text-gray-500">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
} 