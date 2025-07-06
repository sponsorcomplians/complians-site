"use client";

import { useState, useEffect } from 'react';
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
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Edit, 
  Trash2, 
  Plus,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { RemediationAction } from '@/types/master-compliance.types';
import { AI_AGENT_NAMES } from '@/lib/masterComplianceService';
import RemediationActionForm from './RemediationActionForm';

interface RemediationActionListProps {
  workerId?: string;
  agentType?: string;
  className?: string;
}

export default function RemediationActionList({
  workerId,
  agentType,
  className = ""
}: RemediationActionListProps) {
  const [actions, setActions] = useState<RemediationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAction, setEditingAction] = useState<RemediationAction | null>(null);

  useEffect(() => {
    loadActions();
  }, [workerId, agentType]);

  const loadActions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (workerId) params.append('workerId', workerId);
      if (agentType) params.append('agentType', agentType);

      const response = await fetch(`/api/remediation-actions?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch remediation actions');
      }

      setActions(result.data);
    } catch (err) {
      console.error('Error loading remediation actions:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAction = (action: RemediationAction) => {
    if (editingAction) {
      setActions(prev => prev.map(a => a.id === action.id ? action : a));
      setEditingAction(null);
    } else {
      setActions(prev => [action, ...prev]);
    }
    setShowForm(false);
  };

  const handleEditAction = (action: RemediationAction) => {
    setEditingAction(action);
    setShowForm(true);
  };

  const handleDeleteAction = async (actionId: string) => {
    if (!confirm('Are you sure you want to delete this remediation action?')) {
      return;
    }

    try {
      const response = await fetch(`/api/remediation-actions/${actionId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete remediation action');
      }

      setActions(prev => prev.filter(a => a.id !== actionId));
    } catch (err) {
      console.error('Error deleting remediation action:', err);
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'Open':
        return (
          <Badge className={`${baseClasses} bg-red-100 text-red-800 border-red-200`}>
            <AlertTriangle className="w-3 h-3 mr-1" />
            Open
          </Badge>
        );
      case 'In Progress':
        return (
          <Badge className={`${baseClasses} bg-yellow-100 text-yellow-800 border-yellow-200`}>
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      case 'Completed':
        return (
          <Badge className={`${baseClasses} bg-green-100 text-green-800 border-green-200`}>
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
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

  const getStatusCounts = () => {
    const counts = {
      open: actions.filter(a => a.status === 'Open').length,
      inProgress: actions.filter(a => a.status === 'In Progress').length,
      completed: actions.filter(a => a.status === 'Completed').length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-brand-light" />
            <span className="ml-2 text-gray-600">Loading remediation actions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <h3 className="text-red-800 font-medium">Error Loading Actions</h3>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
            <Button onClick={loadActions} className="mt-3">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className={className}>
        {/* Header with Stats */}
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-brand-dark flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Remediation Actions
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Track corrective actions taken for this worker and agent.</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    {statusCounts.open} Open
                  </Badge>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    {statusCounts.inProgress} In Progress
                  </Badge>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {statusCounts.completed} Completed
                  </Badge>
                </div>
                <Button
                  onClick={() => {
                    setEditingAction(null);
                    setShowForm(true);
                  }}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Action
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <RemediationActionForm
                workerId={workerId || ''}
                workerName="Worker Name" // This should be passed as prop
                agentType={agentType}
                existingAction={editingAction || undefined}
                onSave={handleSaveAction}
                onCancel={() => {
                  setShowForm(false);
                  setEditingAction(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Actions Table */}
        <Card>
          <CardContent className="p-0">
            {actions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No remediation actions found.</p>
                <Button
                  onClick={() => {
                    setEditingAction(null);
                    setShowForm(true);
                  }}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Action
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Agent</TableHead>
                      <TableHead>Action Summary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {actions.map((action) => (
                      <TableRow key={action.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="font-medium">
                            {AI_AGENT_NAMES[action.agentType] || action.agentType}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium text-sm">{action.actionSummary}</div>
                            {action.detailedNotes && (
                              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {action.detailedNotes}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(action.status)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {new Date(action.createdAt).toLocaleDateString('en-GB')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAction(action)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAction(action.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
} 