"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BarChartData {
  name: string;
  value: number;
  color?: string;
}

interface MasterComplianceBarChartProps {
  data: BarChartData[];
  title: string;
  className?: string;
  maxHeight?: number;
}

export default function MasterComplianceBarChart({ 
  data, 
  title, 
  className = "",
  maxHeight = 200
}: MasterComplianceBarChartProps) {
  const maxValue = Math.max(...data.map(item => item.value), 1);
  const defaultColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <TooltipProvider>
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="text-brand-dark flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {title}
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{title === "Risk Level Breakdown" 
                  ? "Displays the distribution of workers by overall risk level, enabling you to quickly prioritise high-risk cases for intervention."
                  : "Shows compliance outcomes across each individual AI agent module, highlighting which compliance areas may require additional focus or improvement."
                }</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-around space-x-2" style={{ height: `${maxHeight}px` }}>
            {data.map((item, index) => {
              const height = maxValue > 0 ? (item.value / maxValue) * (maxHeight - 40) : 0;
              const color = item.color || defaultColors[index % defaultColors.length];
              
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="relative w-full max-w-12">
                    <div
                      className="w-full rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer"
                      style={{ 
                        height: `${height}px`,
                        backgroundColor: color,
                        minHeight: item.value > 0 ? '4px' : '0px'
                      }}
                      title={`${item.name}: ${item.value}`}
                    />
                    {item.value > 0 && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                        {item.value}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <span className="text-xs text-gray-600 font-medium block">
                      {item.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {data.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total: {data.reduce((sum, item) => sum + item.value, 0)}</span>
                <span>Max: {maxValue}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
} 