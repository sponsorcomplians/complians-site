// src/components/sw002/sections/ReportingDutiesSection.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarIcon, Plus, AlertTriangle, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ReportingDuty {
  id: string;
  report_type: string;
  event_date: string;
  reported_date?: string;
  details: string;
  reported_by?: string;
  home_office_reference?: string;
  worker_not_started?: boolean;
  absent_without_permission?: boolean;
  absent_without_pay?: boolean;
  salary_reduced?: boolean;
  significant_changes?: boolean;
  work_location_changed?: boolean;
  sponsorship_stopped?: boolean;
}

interface ReportingDutiesSectionProps {
  workerId: string;
  duties: ReportingDuty[];
  onUpdate: () => void;
}

export default function ReportingDutiesSection({ workerId, duties, onUpdate }: ReportingDutiesSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDuty, setNewDuty] = useState<Partial<ReportingDuty>>({
    report_type: '',
    event_date: '',
    details: '',
    reported_by: ''
  });

  const reportTypes = [
    { value: 'worker_not_started', label: 'Worker did not start within 28 days', field: 'worker_not_started' },
    { value: 'absent_without_permission', label: 'Absent without permission > 10 days', field: 'absent_without_permission' },
    { value: 'absent_without_pay', label: 'Absent without pay > 4 weeks', field: 'absent_without_pay' },
    { value: 'salary_reduced', label: 'Salary reduced from CoS level', field: 'salary_reduced' },
    { value: 'significant_changes', label: 'Significant employment changes', field: 'significant_changes' },
    { value: 'work_location_changed', label: 'Work location changed', field: 'work_location_changed' },
    { value: 'sponsorship_stopped', label: 'Sponsorship ended', field: 'sponsorship_stopped' }
  ];

  const handleSubmit = async () => {
    try {
      const selectedType = reportTypes.find(t => t.value === newDuty.report_type);
      const dutyData = {
        ...newDuty,
        worker_id: workerId,
        [selectedType?.field || '']: true
      };

      const response = await fetch('/api/sw002/reporting-duties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dutyData)
      });

      if (response.ok) {
        toast.success('Reporting duty recorded');
        setIsDialogOpen(false);
        setNewDuty({
          report_type: '',
          event_date: '',
          details: '',
          reported_by: ''
        });
        onUpdate();
      }
    } catch (error) {
      toast.error('Failed to record reporting duty');
    }
  };

  const getStatusBadge = (duty: ReportingDuty) => {
    if (duty.reported_date) {
      return <Badge variant="default">Reported</Badge>;
    }
    
    const eventDate = new Date(duty.event_date);
    const daysSince = Math.floor((new Date().getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince > 10) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (daysSince > 5) {
      return <Badge variant="secondary">Pending</Badge>;
    } else {
      return <Badge variant="outline">New</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Reporting Duties</CardTitle>
            <CardDescription>
              Track and report changes that must be reported to the Home Office within 10 working days
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Record Reporting Duty</DialogTitle>
                <DialogDescription>
                  Document any event that requires reporting to the Home Office
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="report_type">Report Type *</Label>
                  <Select
                    value={newDuty.report_type}
                    onValueChange={(value) => setNewDuty({ ...newDuty, report_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Event Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newDuty.event_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newDuty.event_date
                          ? format(new Date(newDuty.event_date), "PPP")
                          : "Select date"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newDuty.event_date ? new Date(newDuty.event_date) : undefined}
                        onSelect={(date) => setNewDuty({ ...newDuty, event_date: date?.toISOString() || '' })}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="details">Details *</Label>
                  <Textarea
                    id="details"
                    value={newDuty.details}
                    onChange={(e) => setNewDuty({ ...newDuty, details: e.target.value })}
                    placeholder="Provide specific details about the event"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reported_by">Reported By</Label>
                    <Input
                      id="reported_by"
                      name="reported_by"
                      value={newDuty.reported_by}
                      onChange={(e) => setNewDuty({ ...newDuty, reported_by: e.target.value })}
                      placeholder="Name of person reporting"
                    />
                  </div>
                  <div>
                    <Label>Reported Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newDuty.reported_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newDuty.reported_date
                            ? format(new Date(newDuty.reported_date), "PPP")
                            : "If already reported"
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newDuty.reported_date ? new Date(newDuty.reported_date) : undefined}
                          onSelect={(date) => setNewDuty({ ...newDuty, reported_date: date?.toISOString() })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div>
                  <Label htmlFor="home_office_reference">Home Office Reference</Label>
                  <Input
                    id="home_office_reference"
                    name="home_office_reference"
                    value={newDuty.home_office_reference}
                    onChange={(e) => setNewDuty({ ...newDuty, home_office_reference: e.target.value })}
                    placeholder="Reference number if provided"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  Save Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> All changes must be reported within 10 working days of the event occurring. 
            Failure to report can result in compliance penalties.
          </AlertDescription>
        </Alert>

        {duties.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No reporting duties recorded</p>
          </div>
        ) : (
          <div className="space-y-3">
            {duties.map((duty) => (
              <div key={duty.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">
                      {reportTypes.find(t => t.value === duty.report_type)?.label || duty.report_type}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Event Date: {format(new Date(duty.event_date), 'dd MMM yyyy')}
                    </p>
                  </div>
                  {getStatusBadge(duty)}
                </div>
                
                <p className="text-sm mb-2">{duty.details}</p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {duty.reported_date && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Reported: {format(new Date(duty.reported_date), 'dd MMM yyyy')}
                    </span>
                  )}
                  {duty.reported_by && (
                    <span>By: {duty.reported_by}</span>
                  )}
                  {duty.home_office_reference && (
                    <span>Ref: {duty.home_office_reference}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}