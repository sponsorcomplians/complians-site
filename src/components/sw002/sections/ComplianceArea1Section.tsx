import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { FileText, Calculator, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ComplianceAreaSectionProps {
  data: any;
  onChange: (field: string, value: any) => void;
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
    // Load immigration monitoring data if it exists
    if (data.immigrationMonitoring) {
      setImmigrationData(data.immigrationMonitoring);
      setShowVariationFields(data.immigrationMonitoring.variation_required || false);
    }
  }, [data]);

  const handleImmigrationChange = (field: string, value: any) => {
    const updatedData = { ...immigrationData, [field]: value };
    setImmigrationData(updatedData);
    onChange('immigrationMonitoring', updatedData);

    // Show/hide variation fields based on variation_required
    if (field === 'variation_required') {
      setShowVariationFields(value);
      if (!value) {
        // Clear variation fields if not required
        const clearedData = { ...updatedData, variation_reason: '', variation_submitted: false, variation_date: '' };
        setImmigrationData(clearedData);
        onChange('immigrationMonitoring', clearedData);
      }
    }
  };

  const calculateDaysSince = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Visa Expiry Reminders</h3>
          
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

          {data.visaExpiry && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm">
                    Visa expires on {format(new Date(data.visaExpiry), 'dd MMM yyyy')} 
                    ({calculateDaysUntil(data.visaExpiry)} days remaining)
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* CoS Assignment */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Certificate of Sponsorship (CoS)</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cos_assigned_date">CoS Assigned Date</Label>
              <DatePicker
                date={immigrationData.cos_assigned_date ? new Date(immigrationData.cos_assigned_date) : undefined}
                onDateChange={(date) => handleImmigrationChange('cos_assigned_date', date?.toISOString())}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cos_expiry_date">CoS Expiry Date</Label>
              <DatePicker
                date={immigrationData.cos_expiry_date ? new Date(immigrationData.cos_expiry_date) : undefined}
                onDateChange={(date) => handleImmigrationChange('cos_expiry_date', date?.toISOString())}
              />
              {immigrationData.cos_expiry_date && calculateDaysUntil(immigrationData.cos_expiry_date) < 30 && (
                <p className="text-sm text-red-600">
                  ⚠️ CoS expires in {calculateDaysUntil(immigrationData.cos_expiry_date)} days
                </p>
              )}
            </div>
          </div>
        </div>

        {/* UKVI SMS Service */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">UKVI SMS Service</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ukvi_sms_sent"
                checked={immigrationData.ukvi_sms_sent || false}
                onChange={(e) => handleImmigrationChange('ukvi_sms_sent', e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="ukvi_sms_sent">UKVI SMS notification sent</Label>
            </div>
            
            {immigrationData.ukvi_sms_sent && (
              <div className="space-y-2">
                <Label htmlFor="ukvi_sms_date">SMS Sent Date</Label>
                <DatePicker
                  date={immigrationData.ukvi_sms_date ? new Date(immigrationData.ukvi_sms_date) : undefined}
                  onDateChange={(date) => handleImmigrationChange('ukvi_sms_date', date?.toISOString())}
                />
              </div>
            )}
          </div>
        </div>

        {/* Start Date Confirmation */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Employment Start Date</h3>
          
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
                date={immigrationData.actual_start_date ? new Date(immigrationData.actual_start_date) : undefined}
                onDateChange={(date) => handleImmigrationChange('actual_start_date', date?.toISOString())}
              />
            </div>
          </div>

          {immigrationData.actual_start_date && data.startDate && 
           immigrationData.actual_start_date !== data.startDate && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <p className="text-sm">
                    Actual start date differs from CoS start date. Consider if a variation is required.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Variation Requirements */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Variation Requirements</h3>
          
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
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="variation_reason">Reason for Variation</Label>
                <Textarea
                  id="variation_reason"
                  placeholder="Explain why a variation is required..."
                  value={immigrationData.variation_reason || ''}
                  onChange={(e) => handleImmigrationChange('variation_reason', e.target.value)}
                  rows={3}
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
                  <Label htmlFor="variation_date">Variation Submission Date</Label>
                  <DatePicker
                    date={immigrationData.variation_date ? new Date(immigrationData.variation_date) : undefined}
                    onDateChange={(date) => handleImmigrationChange('variation_date', date?.toISOString())}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <Label htmlFor="compliance_notes">Additional Compliance Notes</Label>
          <Textarea
            id="compliance_notes"
            placeholder="Add any additional compliance notes or observations..."
            value={immigrationData.notes || ''}
            onChange={(e) => handleImmigrationChange('notes', e.target.value)}
            rows={4}
          />
        </div>

        {/* Compliance Status Summary */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <h4 className="font-semibold mb-2">Compliance Status Summary</h4>
            <ul className="space-y-1 text-sm">
              <li>• Visa expires in: {calculateDaysUntil(data.visaExpiry) || 'N/A'} days</li>
              <li>• 60-day reminder: {immigrationData.reminder_60_days_set ? '✓ Sent' : '✗ Not sent'}</li>
              <li>• 30-day reminder: {immigrationData.reminder_30_days_set ? '✓ Sent' : '✗ Not sent'}</li>
              <li>• UKVI SMS: {immigrationData.ukvi_sms_sent ? '✓ Sent' : '✗ Not sent'}</li>
              <li>• Start date confirmed: {immigrationData.start_date_confirmed ? '✓ Yes' : '✗ No'}</li>
              <li>• Variation required: {immigrationData.variation_required ? '⚠️ Yes' : '✓ No'}</li>
            </ul>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}