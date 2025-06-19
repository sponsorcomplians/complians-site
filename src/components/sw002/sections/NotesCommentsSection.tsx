// src/components/sw002/sections/NotesCommentsSection.tsx
'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, FileText, User, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

interface NotesComment {
  id?: string;
  compliance_audit_date?: string;
  compliance_audit_notes?: string;
  action_plan_created?: boolean;
  payslip_months?: string[];
  general_notes?: string;
  reviewed_by_name?: string;
  reviewed_by_title?: string;
  reviewed_date?: string;
  signature_confirmed?: boolean;
}

interface NotesCommentsSectionProps {
  workerId: string;
  notes: NotesComment[];
  onUpdate: () => void;
}

export default function NotesCommentsSection({ workerId, notes, onUpdate }: NotesCommentsSectionProps) {
  const currentNote = notes[0] || {};
  const [formData, setFormData] = useState<NotesComment>({
    compliance_audit_date: currentNote.compliance_audit_date || '',
    compliance_audit_notes: currentNote.compliance_audit_notes || '',
    action_plan_created: currentNote.action_plan_created || false,
    payslip_months: currentNote.payslip_months || [],
    general_notes: currentNote.general_notes || '',
    reviewed_by_name: currentNote.reviewed_by_name || '',
    reviewed_by_title: currentNote.reviewed_by_title || '',
    reviewed_date: currentNote.reviewed_date || '',
    signature_confirmed: currentNote.signature_confirmed || false
  });

  const [selectedPayslipMonths, setSelectedPayslipMonths] = useState<string>('');

  const handleSave = async () => {
    try {
      const response = await fetch('/api/sw002/notes-comments', {
        method: currentNote.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          worker_id: workerId,
          id: currentNote.id
        })
      });

      if (response.ok) {
        toast.success('Notes saved successfully');
        onUpdate();
      }
    } catch (error) {
      toast.error('Failed to save notes');
    }
  };

  const addPayslipMonth = () => {
    if (selectedPayslipMonths && !formData.payslip_months?.includes(selectedPayslipMonths)) {
      setFormData({
        ...formData,
        payslip_months: [...(formData.payslip_months || []), selectedPayslipMonths]
      });
      setSelectedPayslipMonths('');
    }
  };

  const removePayslipMonth = (month: string) => {
    setFormData({
      ...formData,
      payslip_months: formData.payslip_months?.filter(m => m !== month) || []
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes/Comments</CardTitle>
        <CardDescription>
          Document compliance audit findings, action plans, and sign-off details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Example Notes from Form */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Example from Esteemed Life Ltd:</strong><br />
            The Company undertook a compliance audit on 17 March 2025 and engaged HR, Recruitment, and Regulatory compliance experts to create a comprehensive action plan to demonstrate sponsor compliance at a high level.
          </AlertDescription>
        </Alert>

        {/* Compliance Audit Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Compliance Audit</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Audit Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.compliance_audit_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.compliance_audit_date
                      ? format(new Date(formData.compliance_audit_date), "dd MMM yyyy")
                      : "Select audit date"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.compliance_audit_date ? new Date(formData.compliance_audit_date) : undefined}
                    onSelect={(date) => setFormData({ ...formData, compliance_audit_date: date?.toISOString() })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="action_plan"
                checked={formData.action_plan_created || false}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, action_plan_created: checked as boolean })
                }
              />
              <Label htmlFor="action_plan">Action Plan Created</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="audit_notes">Audit Notes</Label>
            <Textarea
              id="audit_notes"
              value={formData.compliance_audit_notes || ''}
              onChange={(e) => setFormData({ ...formData, compliance_audit_notes: e.target.value })}
              placeholder="Document key findings and recommendations from the compliance audit"
              rows={4}
            />
          </div>
        </div>

        <Separator />

        {/* Payslip Verification */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Payslip Verification</h3>
          <p className="text-sm text-muted-foreground">
            Track which months' payslips have been verified against CoS salary
          </p>
          
          <div className="flex gap-2">
            <Input
              type="month"
              value={selectedPayslipMonths}
              onChange={(e) => setSelectedPayslipMonths(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={addPayslipMonth} variant="outline">
              Add Month
            </Button>
          </div>

          {formData.payslip_months && formData.payslip_months.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.payslip_months.map((month) => (
                <div
                  key={month}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  <span>{format(new Date(month), 'MMM yyyy')}</span>
                  <button
                    onClick={() => removePayslipMonth(month)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    Ã—
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* General Notes */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">General Notes</h3>
          <Textarea
            value={formData.general_notes || ''}
            onChange={(e) => setFormData({ ...formData, general_notes: e.target.value })}
            placeholder="Any additional notes or comments about this worker's compliance status"
            rows={5}
          />
        </div>

        <Separator />

        {/* Sign-off Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Review Sign-off</h3>
          <p className="text-sm text-muted-foreground">
            This form must be reviewed and updated regularly and must be signed and dated below by the HR or AO.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reviewer_name">Full Name</Label>
              <Input
                id="reviewer_name"
                value={formData.reviewed_by_name || ''}
                onChange={(e) => setFormData({ ...formData, reviewed_by_name: e.target.value })}
                placeholder="Name of reviewer"
              />
            </div>
            <div>
              <Label htmlFor="reviewer_title">Job Title</Label>
              <Input
                id="reviewer_title"
                value={formData.reviewed_by_title || ''}
                onChange={(e) => setFormData({ ...formData, reviewed_by_title: e.target.value })}
                placeholder="e.g., HR Manager"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Review Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.reviewed_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.reviewed_date
                      ? format(new Date(formData.reviewed_date), "dd MMM yyyy")
                      : "Select date"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.reviewed_date ? new Date(formData.reviewed_date) : undefined}
                    onSelect={(date) => setFormData({ ...formData, reviewed_date: date?.toISOString() })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="signature"
                checked={formData.signature_confirmed || false}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, signature_confirmed: checked as boolean })
                }
              />
              <Label htmlFor="signature">
                I confirm this review and sign-off
              </Label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Notes & Comments
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
