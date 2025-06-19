'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateReportModal({ isOpen, onClose, onSuccess }: CreateReportModalProps) {
  const [reportType, setReportType] = useState('compliance');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // TODO: Implement report generation
      // For now, just show a success message
      setTimeout(() => {
        toast.success('Report generation started. You will receive an email when it\'s ready.');
        onSuccess();
        onClose();
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('Failed to create report');
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Report</DialogTitle>
            <DialogDescription>
              Generate a report for your workers and compliance data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Report Type</Label>
              <RadioGroup value={reportType} onValueChange={setReportType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="compliance" id="compliance" />
                  <Label htmlFor="compliance" className="font-normal cursor-pointer">
                    Compliance Summary
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expiring" id="expiring" />
                  <Label htmlFor="expiring" className="font-normal cursor-pointer">
                    Expiring Documents
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="workers" id="workers" />
                  <Label htmlFor="workers" className="font-normal cursor-pointer">
                    All Workers
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="departments" id="departments" />
                  <Label htmlFor="departments" className="font-normal cursor-pointer">
                    By Department
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeInactive"
                checked={includeInactive}
                onCheckedChange={(checked) => setIncludeInactive(checked as boolean)}
              />
              <Label
                htmlFor="includeInactive"
                className="text-sm font-normal cursor-pointer"
              >
                Include inactive workers
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}