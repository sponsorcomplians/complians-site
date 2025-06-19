'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ComplianceAreaSectionProps {
  data: any;
  onChange: (field: string, value: any) => void;
  onSave: (section: string) => void;
}

interface ImmigrationMonitoringData {
  reminder_60_days_set?: boolean;
  reminder_30_days_set?: boolean;
  cos_assigned_date?: string;
  cos_expiry_date?: string;
  ukvi_sms_sent?: boolean;
  ukvi_sms_date?: string;
  start_date_confirmed?: boolean;
  actual_start_date?: string;
  variation_required?: boolean;
  variation_reason?: string;
  variation_submitted?: boolean;
  variation_date?: string;
  notes?: string;
}

export default function ComplianceAreaSection({ data, onChange }: ComplianceAreaSectionProps) {
  const [immigrationData, setImmigrationData] = useState<ImmigrationMonitoringData>({});
  const [showVariationFields, setShowVariationFields] = useState(false);

  useEffect(() => {
    if (data.immigrationMonitoring) {
      setImmigrationData(data.immigrationMonitoring);
      setShowVariationFields(data.immigrationMonitoring.variation_required || false);
    }
  }, [data]);

  const handleImmigrationChange = (field: string, value: any) => {
    const updatedData = { ...immigrationData, [field]: value };
    setImmigrationData(updatedData);
    onChange('immigrationMonitoring', updatedData);

    if (field === 'variation_required') {
      setShowVariationFields(value);
      if (!value) {
        const clearedData = { ...updatedData, variation_reason: '', variation_submitted: false, variation_date: '' };
        setImmigrationData(clearedData);
        onChange('immigrationMonitoring', clearedData);
      }
    }
  };

  const calculateDaysUntil = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle>Immigration Status Monitoring</CardTitle>
        </div>
        <CardDescription>
          Track visa expiry dates, reminders, and compliance requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Visa Expiry Reminders */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="reminder_60_days"
              checked={immigrationData.reminder_60_days_set || false}
              onChange={(e) => handleImmigrationChange('reminder_60_days_set', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="reminder_60_days">60-day reminder sent</Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="reminder_30_days"
              checked={immigrationData.reminder_30_days_set || false}
              onChange={(e) => handleImmigrationChange('reminder_30_days_set', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="reminder_30_days">30-day reminder sent</Label>
          </div>
        </div>

        {/* CoS Assignment */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cos_assigned_date">CoS Assigned Date</Label>
            <DatePicker
              selected={immigrationData.cos_assigned_date ? new Date(immigrationData.cos_assigned_date) : undefined}
              onSelect={(date) => handleImmigrationChange('cos_assigned_date', date?.toISOString())}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cos_expiry_date">CoS Expiry Date</Label>
            <DatePicker
              selected={immigrationData.cos_expiry_date ? new Date(immigrationData.cos_expiry_date) : undefined}
              onSelect={(date) => handleImmigrationChange('cos_expiry_date', date?.toISOString())}
            />
          </div>
        </div>

        {/* UKVI SMS */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="ukvi_sms_sent"
              checked={immigrationData.ukvi_sms_sent || false}
              onChange={(e) => handleImmigrationChange('ukvi_sms_sent', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="ukvi_sms_sent">UKVI SMS sent</Label>
          </div>

          {immigrationData.ukvi_sms_sent && (
            <div className="space-y-2">
              <Label htmlFor="ukvi_sms_date">UKVI SMS Date</Label>
              <DatePicker
                selected={immigrationData.ukvi_sms_date ? new Date(immigrationData.ukvi_sms_date) : undefined}
                onSelect={(date) => handleImmigrationChange('ukvi_sms_date', date?.toISOString())}
              />
            </div>
          )}
        </div>

        {/* Employment Start Date */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="start_date_confirmed"
              checked={immigrationData.start_date_confirmed || false}
              onChange={(e) => handleImmigrationChange('start_date_confirmed', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="start_date_confirmed">Start date confirmed</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="actual_start_date">Actual Start Date</Label>
            <DatePicker
              selected={immigrationData.actual_start_date ? new Date(immigrationData.actual_start_date) : undefined}
              onSelect={(date) => handleImmigrationChange('actual_start_date', date?.toISOString())}
            />
          </div>
        </div>

        {/* Variation */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="variation_required"
              checked={immigrationData.variation_required || false}
              onChange={(e) => handleImmigrationChange('variation_required', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="variation_required">Variation required</Label>
          </div>

          {showVariationFields && (
            <>
              <div className="space-y-2">
                <Label htmlFor="variation_reason">Reason</Label>
                <Textarea
                  id="variation_reason"
                  value={immigrationData.variation_reason || ''}
                  onChange={(e) => handleImmigrationChange('variation_reason', e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="variation_submitted"
                  checked={immigrationData.variation_submitted || false}
                  onChange={(e) => handleImmigrationChange('variation_submitted', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="variation_submitted">Variation submitted</Label>
              </div>

              {immigrationData.variation_submitted && (
                <div className="space-y-2">
                  <Label htmlFor="variation_date">Variation Date</Label>
                  <DatePicker
                    selected={immigrationData.variation_date ? new Date(immigrationData.variation_date) : undefined}
                    onSelect={(date) => handleImmigrationChange('variation_date', date?.toISOString())}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={immigrationData.notes || ''}
            onChange={(e) => handleImmigrationChange('notes', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
