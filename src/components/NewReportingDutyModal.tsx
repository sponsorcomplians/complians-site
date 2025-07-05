// src/components/NewReportingDutyModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { X } from 'lucide-react';

interface Worker {
  id: string;
  name: string;
  email: string;
}

interface NewReportingDutyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function NewReportingDutyModal({ isOpen, onClose, onSuccess }: NewReportingDutyModalProps) {
  const [formData, setFormData] = useState({
    worker_id: '',
    event_type: '',
    event_date: '',
    notes: ''
  });
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchWorkers();
    }
  }, [isOpen]);

  const fetchWorkers = async () => {
    try {
      const response = await fetch('/api/workers');
      const data = await response.json();
      setWorkers(data.workers || []);
    } catch (err) {
      console.error('Failed to fetch workers:', err);
      setError('Failed to load workers');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/reporting-duties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create reporting duty');
      }

      // Reset form
      setFormData({
        worker_id: '',
        event_type: '',
        event_date: '',
        notes: ''
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to create reporting duty:', err);
      setError('Failed to create reporting duty');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Reporting Duty</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Worker Select */}
          <div>
            <Label htmlFor="worker">Worker *</Label>
            <Select
              id="worker"
              value={formData.worker_id}
              onChange={(e) => setFormData({ ...formData, worker_id: e.target.value })}
              required
            >
              <option value="">Select a worker</option>
              {workers.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Event Type Select */}
          <div>
            <Label htmlFor="event_type">Event Type *</Label>
            <Select
              id="event_type"
              value={formData.event_type}
              onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
              required
            >
              <option value="">Select event type</option>
              <option value="incident">Incident</option>
              <option value="hazard">Hazard</option>
              <option value="near_miss">Near Miss</option>
              <option value="observation">Observation</option>
            </Select>
          </div>

          {/* Event Date */}
          <div>
            <Label htmlFor="event_date">Event Date *</Label>
            <Input
              id="event_date"
              name="event_date"
              type="date"
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              required
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              className="w-full min-h-[100px] px-3 py-2 text-sm border rounded-md"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional details..."
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}