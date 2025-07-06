"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from 'lucide-react';

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
  
  // Calculate angles for pie chart
  let currentAngle = 0;
  const segments = data.map(item => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    
    return {
      ...item,
      percentage,
      startAngle,
      endAngle: currentAngle
    };
  });

  // Generate SVG path for pie chart
  const generatePath = (startAngle: number, endAngle: number, radius: number) => {
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = radius * Math.cos(startRad);
    const y1 = radius * Math.sin(startRad);
    const x2 = radius * Math.cos(endRad);
    const y2 = radius * Math.sin(endRad);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    
    return [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'L 0 0'
    ].join(' ');
  };

  const radius = 80;
  const centerX = 100;
  const centerY = 100;

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="text-brand-dark flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <svg width="200" height="200" className="mb-4">
            <g transform={`translate(${centerX}, ${centerY})`}>
              {segments.map((segment, index) => (
                <path
                  key={index}
                  d={generatePath(segment.startAngle, segment.endAngle, radius)}
                  fill={segment.color}
                  stroke="#fff"
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </g>
          </svg>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium text-gray-700">
                {item.name}
              </span>
              <span className="text-sm text-gray-500">
                ({item.value})
              </span>
            </div>
          ))}
        </div>
        
        {total > 0 && (
          <div className="text-center mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Total: <span className="font-semibold">{total}</span> workers
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 