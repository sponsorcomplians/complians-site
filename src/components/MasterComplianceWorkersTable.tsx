"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Users, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { MasterComplianceWorker } from '@/types/master-compliance.types';

interface MasterComplianceWorkersTableProps {
  workers: MasterComplianceWorker[];
  totalCount: number;
  filteredCount: number;
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  className?: string;
}

export default function MasterComplianceWorkersTable({
  workers,
  totalCount,
  filteredCount,
  pagination,
  onPageChange,
  className = ""
}: MasterComplianceWorkersTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (workerId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(workerId)) {
      newExpanded.delete(workerId);
    } else {
      newExpanded.add(workerId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusBadge = (status: string, redFlag: boolean = false) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'COMPLIANT':
        return (
          <Badge className={`${baseClasses} bg-green-100 text-green-800 border-green-200`}>
            <CheckCircle className="w-3 h-3 mr-1" />
            Compliant
          </Badge>
        );
      case 'BREACH':
        return (
          <Badge className={`${baseClasses} bg-yellow-100 text-yellow-800 border-yellow-200`}>
            <AlertTriangle className="w-3 h-3 mr-1" />
            Breach
          </Badge>
        );
      case 'SERIOUS_BREACH':
        return (
          <Badge className={`${baseClasses} bg-red-100 text-red-800 border-red-200`}>
            <XCircle className="w-3 h-3 mr-1" />
            Serious Breach
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className={`${baseClasses} bg-gray-100 text-gray-800 border-gray-200`}>
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge className={`${baseClasses} bg-gray-100 text-gray-800 border-gray-200`}>
            {status}
          </Badge>
        );
    }
  };

  const getRiskLevelBadge = (riskLevel: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (riskLevel) {
      case 'LOW':
        return (
          <Badge className={`${baseClasses} bg-green-100 text-green-800 border-green-200`}>
            Low Risk
          </Badge>
        );
      case 'MEDIUM':
        return (
          <Badge className={`${baseClasses} bg-yellow-100 text-yellow-800 border-yellow-200`}>
            Medium Risk
          </Badge>
        );
      case 'HIGH':
        return (
          <Badge className={`${baseClasses} bg-red-100 text-red-800 border-red-200`}>
            High Risk
          </Badge>
        );
      default:
        return (
          <Badge className={`${baseClasses} bg-gray-100 text-gray-800 border-gray-200`}>
            {riskLevel}
          </Badge>
        );
    }
  };

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="text-brand-dark flex items-center gap-2">
          <Users className="h-5 w-5" />
          Workers Overview
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({filteredCount} of {totalCount})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12"></TableHead>
                <TableHead>Worker Name</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>SOC Code</TableHead>
                <TableHead>CoS Reference</TableHead>
                <TableHead>Overall Status</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Red Flags</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workers.map((worker) => (
                <>
                  <TableRow key={worker.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRow(worker.id)}
                        className="p-1 h-6 w-6"
                      >
                        {expandedRows.has(worker.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{worker.name}</TableCell>
                    <TableCell>{worker.jobTitle}</TableCell>
                    <TableCell>{worker.socCode}</TableCell>
                    <TableCell>{worker.cosReference}</TableCell>
                    <TableCell>
                      {getStatusBadge(worker.overallComplianceStatus, worker.totalRedFlags > 0)}
                    </TableCell>
                    <TableCell>
                      {getRiskLevelBadge(worker.overallRiskLevel)}
                    </TableCell>
                    <TableCell>
                      {worker.totalRedFlags > 0 ? (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          {worker.totalRedFlags}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/workers/${worker.id}`}>
                          <Button variant="outline" size="sm" className="h-7">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded row with agent details */}
                  {expandedRows.has(worker.id) && (
                    <TableRow>
                      <TableCell colSpan={9} className="bg-gray-50 p-4">
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Agent Compliance Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {Object.entries(worker.agentCompliance).map(([agentType, compliance]) => (
                              <div key={agentType} className="bg-white p-3 rounded-lg border">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    {agentType.replace('ai-', '').replace('-compliance', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </span>
                                  <Link href={`/${agentType}`}>
                                    <Button variant="ghost" size="sm" className="h-6 text-xs">
                                      View
                                    </Button>
                                  </Link>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Status:</span>
                                    {getStatusBadge(compliance.status, compliance.redFlag)}
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Risk:</span>
                                    {getRiskLevelBadge(compliance.riskLevel)}
                                  </div>
                                  {compliance.redFlag && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-500">Red Flag:</span>
                                      <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                                        Yes
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 