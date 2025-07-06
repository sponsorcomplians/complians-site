"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  X, 
  AlertTriangle,
  CheckCircle,
  Clock,
  HelpCircle
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CreateRemediationActionRequest, UpdateRemediationActionRequest, RemediationAction } from '@/types/master-compliance.types';
import { AI_AGENT_NAMES } from '@/lib/masterComplianceService';

interface RemediationActionFormProps {
  workerId: string;
  workerName: string;
  agentType?: string;
  existingAction?: RemediationAction;
  onSave: (action: RemediationAction) => void;
  onCancel: () => void;
  className?: string;
}

export default function RemediationActionForm({
  workerId,
  workerName,
  agentType,
  existingAction,
  onSave,
  onCancel,
  className = ""
}: RemediationActionFormProps) {
  const [formData, setFormData] = useState({
    actionSummary: existingAction?.actionSummary || '',
    detailedNotes: existingAction?.detailedNotes || '',
    status: existingAction?.status || 'Open'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = existingAction 
        ? `/api/remediation-actions/${existingAction.id}`
        : '/api/remediation-actions';

      const method = existingAction ? 'PUT' : 'POST';
      const body = existingAction 
        ? { ...formData } as UpdateRemediationActionRequest
        : { 
            workerId, 
            agentType: agentType || '', 
            ...formData 
          } as CreateRemediationActionRequest;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save remediation action');
      }

      onSave(result.data);
    } catch (err) {
      console.error('Error saving remediation action:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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

  return (
    <TooltipProvider>
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="text-brand-dark flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            {existingAction ? 'Edit Remediation Action' : 'Add Remediation Action'}
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Track corrective actions taken for this worker and agent.</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Worker Info */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Worker</div>
              <div className="font-medium">{workerName}</div>
              {agentType && (
                <div className="text-sm text-gray-500 mt-1">
                  Agent: {AI_AGENT_NAMES[agentType] || agentType}
                </div>
              )}
            </div>

            {/* Action Summary */}
            <div>
              <label htmlFor="actionSummary" className="block text-sm font-medium text-gray-700 mb-2">
                Action Summary *
              </label>
              <Input
                id="actionSummary"
                name="actionSummary"
                value={formData.actionSummary}
                onChange={(e) => setFormData(prev => ({ ...prev, actionSummary: e.target.value }))}
                placeholder="Brief description of the corrective action taken..."
                required
                className="w-full"
              />
            </div>

            {/* Detailed Notes */}
            <div>
              <label htmlFor="detailedNotes" className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Notes
              </label>
              <Textarea
                id="detailedNotes"
                value={formData.detailedNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, detailedNotes: e.target.value }))}
                placeholder="Provide detailed information about the action, timeline, and outcomes..."
                rows={4}
                className="w-full"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                      Open
                    </div>
                  </SelectItem>
                  <SelectItem value="In Progress">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                      In Progress
                    </div>
                  </SelectItem>
                  <SelectItem value="Completed">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Completed
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Current Status Display */}
            {existingAction && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Current Status:</span>
                {getStatusBadge(formData.status)}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-red-800 text-sm">{error}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.actionSummary.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : existingAction ? 'Update Action' : 'Save Action'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
} 