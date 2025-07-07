"use client";

import React, { useState } from 'react';
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
  Clock,
  FileText,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { MasterComplianceWorker } from '@/types/master-compliance.types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MasterComplianceWorkersTableProps {
  workers: MasterComplianceWorker[];
  totalCount: number;
  filteredCount: number;
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  className?: string;
  onGenerateNarrative?: (workerName: string) => void;
  generatingNarrative?: string | null;
}

// Comprehensive safe render helper
const safe = (value: any): React.ReactNode => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (React.isValidElement(value)) return value;
  if (Array.isArray(value)) return value.map((v, i) => <React.Fragment key={i}>{safe(v)}</React.Fragment>);
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === 'object') {
    // Check for common object properties
    if (value.message) return value.message;
    if (value.error) return value.error;
    if (value.data) return safe(value.data);
    if (value.toString && value.toString !== Object.prototype.toString) return value.toString();
    return JSON.stringify(value);
  }
  return String(value);
};

export default function MasterComplianceWorkersTable({
  workers,
  totalCount,
  filteredCount,
  pagination,
  onPageChange,
  className = "",
  onGenerateNarrative,
  generatingNarrative
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
    
    if (redFlag) {
      return (
        <Badge className={`${baseClasses} bg-red-100 text-red-800 border-red-200`}>
          <AlertTriangle className="w-3 h-3 mr-1" />
          Red Flag
        </Badge>
      );
    }
    
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
      default:
        return (
          <Badge className={`${baseClasses} bg-gray-100 text-gray-800 border-gray-200`}>
            {safe(status)}
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
            {safe(riskLevel)}
          </Badge>
        );
    }
  };

  return (
    <TooltipProvider>
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="text-brand-dark flex items-center gap-2">
            <Users className="h-5 w-5" />
            Workers Overview
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({safe(filteredCount)} of {safe(totalCount)})
            </span>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Detailed list of all workers assessed, including their compliance status, risk level, and related agent assessments. Click 'View Report' to see full individual narratives.</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12"></TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Worker Name
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-3 w-3 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Name of the sponsored worker</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Job Title
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-3 w-3 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Job title as specified in the Certificate of Sponsorship</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      SOC Code
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-3 w-3 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Standard Occupational Classification code for the role</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      CoS Reference
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-3 w-3 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Certificate of Sponsorship reference number</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Overall Status
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-3 w-3 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Overall compliance status across all 15 AI agents. Red flags indicate critical issues.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Risk Level
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-3 w-3 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Combined risk assessment across all compliance areas</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Red Flags
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-3 w-3 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Number of serious compliance breaches requiring immediate attention</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workers.map((worker) => {
                  // Defensive rendering: ensure all worker data is properly typed
                  const workerName = typeof worker.name === 'string' ? worker.name : 'Unknown Worker';
                  const jobTitle = typeof worker.jobTitle === 'string' ? worker.jobTitle : 'Unknown Role';
                  const socCode = typeof worker.socCode === 'string' ? worker.socCode : 'Unknown SOC';
                  const cosReference = typeof worker.cosReference === 'string' ? worker.cosReference : 'Unknown CoS';
                  const totalRedFlags = typeof worker.totalRedFlags === 'number' ? worker.totalRedFlags : 0;
                  
                  return (
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
                        <TableCell className="font-medium">
                          {safe(workerName)}
                        </TableCell>
                        <TableCell>
                          {safe(jobTitle)}
                        </TableCell>
                        <TableCell>
                          {safe(socCode)}
                        </TableCell>
                        <TableCell>
                          {safe(cosReference)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(worker.overallComplianceStatus, totalRedFlags > 0)}
                        </TableCell>
                        <TableCell>
                          {getRiskLevelBadge(worker.overallRiskLevel)}
                        </TableCell>
                        <TableCell>
                          {totalRedFlags > 0 ? (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              {safe(totalRedFlags)}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newExpanded = new Set(expandedRows);
                                if (newExpanded.has(worker.id)) {
                                  newExpanded.delete(worker.id);
                                } else {
                                  newExpanded.add(worker.id);
                                }
                                setExpandedRows(newExpanded);
                              }}
                            >
                              {safe(expandedRows.has(worker.id) ? 'Hide' : 'Show')} Details
                            </Button>
                            {onGenerateNarrative && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onGenerateNarrative(workerName)}
                                disabled={generatingNarrative === workerName}
                              >
                                {generatingNarrative === workerName ? (
                                  <>
                                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                    {safe('Generating...')}
                                  </>
                                ) : (
                                  <>
                                    <FileText className="h-3 w-3 mr-1" />
                                    {safe('Narrative')}
                                  </>
                                )}
                              </Button>
                            )}
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
                                {Object.entries(worker.agentCompliance).map(([agentType, compliance]) => {
                                  // Defensive rendering for compliance data
                                  const status = typeof compliance.status === 'string' ? compliance.status : 'UNKNOWN';
                                  const riskLevel = typeof compliance.riskLevel === 'string' ? compliance.riskLevel : 'UNKNOWN';
                                  const redFlag = typeof compliance.redFlag === 'boolean' ? compliance.redFlag : false;
                                  
                                  return (
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
                                          {getStatusBadge(status, redFlag)}
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs text-gray-500">Risk:</span>
                                          {getRiskLevelBadge(riskLevel)}
                                        </div>
                                        {redFlag && (
                                          <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Red Flag:</span>
                                            <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                                              Yes
                                            </Badge>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Page {safe(pagination.page)} of {safe(pagination.totalPages)}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
} 