'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { X } from 'lucide-react';
import { workerService, reportingDutyService } from '@/lib/supabase/services';

interface Worker {
  id: string;
  first_name: string;
  last_name: string;
}

interface NewReportingDutyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EVENT_TYPES = [
  { value: 'Change of Address', label: 'Change of Address' },
  { value: 'Change of Employment Status', label: 'Change of Employment Status' },
  { value: 'Salary Change', label: 'Salary Change' },
  { value: 'Job Title Change', label: 'Job Title Change' },
  { value: 'Work Location Change', label: 'Work Location Change' },
  { value: 'Working Hours Change', label: 'Working Hours Change' },
  { value: 'Sponsor License Renewal', label: 'Sponsor License Renewal' },
  { value: 'Annual BRP Check', label: 'Annual BRP Check' },
  { value: 'Passport Renewal', label: 'Passport Renewal' },
  { value: 'Visa Extension', label: 'Visa Extension' },
  { value: 'New Starter', label: 'New Starter' },
  { value: 'Resignation', label: 'Resignation' },
  { value: 'Termination', label: 'Termination' },
  { value: 'Maternity/Paternity Leave', label: 'Maternity/Paternity Leave' },
  { value: 'Extended Absence', label: 'Extended Absence' },
  { value: 'Return from Extended Absence', label: 'Return from Extended Absence' },
  { value: 'Disciplinary Action', label: 'Disciplinary Action' },
  { value: 'Criminal Conviction', label: 'Criminal Conviction' },
  { value: 'Other', label: 'Other' }
];

export default function NewReportingDutyModal({ isOpen, onClose, onSuccess }: NewReportingDutyModalProps) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [formData, setFormData] = useState({
    worker_id: '',
    event_type: '',
    event_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchWorkers();
    }
  }, [isOpen]);

  const fetchWorkers = async () => {
    try {
      const data = await workerService.getWorkers();
      setWorkers(data);
    } catch (err) {
      console.error('Failed to fetch workers:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.worker_id || !formData.event_type) {
      setError('Please select a worker and event type');
      return;
    }

    setLoading(true);
    try {
      await reportingDutyService.createReportingDuty(
        formData.worker_id,
        formData.event_type,
        { notes: formData.notes, event_date: formData.event_date }
      );
      
      // Reset form
      setFormData({
        worker_id: '',
        event_type: '',
        event_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to create reporting duty');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Add New Reporting Duty</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Worker"
              value={formData.worker_id}
              onChange={(e) => setFormData({ ...formData, worker_id: e.target.value })}
              options={workers.map(w => ({
                value: w.id,
                label: `${w.first_name} ${w.last_name}`
              }))}
              required
            />

            <Select
              label="Event Type"
              value={formData.event_type}
              onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
              options={EVENT_TYPES}
              required
            />

            <Input
              label="Event Date"
              type="date"
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Notes (Optional)
              </label>
              <textarea
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm 
                  placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 
                  focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any relevant details about this event..."
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Reporting Duty'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}