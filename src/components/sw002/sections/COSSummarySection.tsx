// src/components/sw002/sections/COSSummarySection.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface COSSummaryData {
  tier_category?: string;
  sponsor_licence_number?: string;
  sponsor_name?: string;
  certificate_number?: string;
  date_cos_assigned?: string;
  uk_entry_date?: string;
  brp_reference?: string;
  brp_issue_date?: string;
  brp_expiry_date?: string;
  rtw_expiry_date?: string;
  current_home_address?: string;
  city_or_town?: string;
  postcode?: string;
  country?: string;
  job_type?: string;
  job_title?: string;
  gross_salary?: number;
  work_start_date?: string;
  work_end_date?: string;
}

interface COSSummarySectionProps {
  data: COSSummaryData;
  onChange: (data: COSSummaryData) => void;
  onSave: () => void;
}

export default function COSSummarySection({ data, onChange, onSave }: COSSummarySectionProps) {
  const handleFieldChange = (field: keyof COSSummaryData, value: string | number) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const handleDateChange = (field: keyof COSSummaryData, date: Date | undefined) => {
    onChange({
      ...data,
      [field]: date ? date.toISOString() : undefined
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Certificate of Sponsorship (CoS) Summary</CardTitle>
        <CardDescription>
          Complete all details as shown on the Certificate of Sponsorship
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sponsorship Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Sponsorship Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tier_category">Tier & Category *</Label>
              <Input
                id="tier_category"
                name="tier_category"
                value={data.tier_category || ''}
                onChange={(e) => handleFieldChange('tier_category', e.target.value)}
                placeholder="e.g., Skilled Worker (New hires - defined)"
                required
              />
            </div>
            <div>
              <Label htmlFor="uk_entry_date">UK Entry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !data.uk_entry_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.uk_entry_date 
                      ? format(new Date(data.uk_entry_date), "dd/MM/yyyy") 
                      : "Select date"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data.uk_entry_date ? new Date(data.uk_entry_date) : undefined}
                    onSelect={(date) => handleDateChange('uk_entry_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sponsor_licence_number">Sponsor Licence Number *</Label>
              <Input
                id="sponsor_licence_number"
                name="sponsor_licence_number"
                value={data.sponsor_licence_number || ''}
                onChange={(e) => handleFieldChange('sponsor_licence_number', e.target.value)}
                placeholder="e.g., 7GPDNRHJ1"
                required
              />
            </div>
            <div>
              <Label htmlFor="sponsor_name">Sponsor Name *</Label>
              <Input
                id="sponsor_name"
                name="sponsor_name"
                value={data.sponsor_name || ''}
                onChange={(e) => handleFieldChange('sponsor_name', e.target.value)}
                placeholder="e.g., ESTEEMED LIFE LTD"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="certificate_number">Certificate Number *</Label>
              <Input
                id="certificate_number"
                name="certificate_number"
                value={data.certificate_number || ''}
                onChange={(e) => handleFieldChange('certificate_number', e.target.value)}
                placeholder="e.g., C2G8L98342Q"
                required
              />
            </div>
            <div>
              <Label>Date CoS Assigned *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !data.date_cos_assigned && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.date_cos_assigned 
                      ? format(new Date(data.date_cos_assigned), "dd/MM/yyyy") 
                      : "Select date"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data.date_cos_assigned ? new Date(data.date_cos_assigned) : undefined}
                    onSelect={(date) => handleDateChange('date_cos_assigned', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* BRP Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">BRP Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brp_reference">BRP Reference</Label>
              <Input
                id="brp_reference"
                name="brp_reference"
                value={data.brp_reference || ''}
                onChange={(e) => handleFieldChange('brp_reference', e.target.value)}
                placeholder="e.g., RT7111600"
              />
            </div>
            <div>
              <Label>BRP Issue Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !data.brp_issue_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.brp_issue_date 
                      ? format(new Date(data.brp_issue_date), "dd/MM/yyyy") 
                      : "Select date"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data.brp_issue_date ? new Date(data.brp_issue_date) : undefined}
                    onSelect={(date) => handleDateChange('brp_issue_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>BRP Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !data.brp_expiry_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.brp_expiry_date 
                      ? format(new Date(data.brp_expiry_date), "dd/MM/yyyy") 
                      : "Select date"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data.brp_expiry_date ? new Date(data.brp_expiry_date) : undefined}
                    onSelect={(date) => handleDateChange('brp_expiry_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>RTW Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !data.rtw_expiry_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.rtw_expiry_date 
                      ? format(new Date(data.rtw_expiry_date), "dd/MM/yyyy") 
                      : "Select date"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data.rtw_expiry_date ? new Date(data.rtw_expiry_date) : undefined}
                    onSelect={(date) => handleDateChange('rtw_expiry_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Current Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Current Address</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="current_home_address">Home Address</Label>
              <Input
                id="current_home_address"
                name="current_home_address"
                value={data.current_home_address || ''}
                onChange={(e) => handleFieldChange('current_home_address', e.target.value)}
                placeholder="e.g., 123 Main St"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city_or_town">City/Town</Label>
                <Input
                  id="city_or_town"
                  name="city_or_town"
                  value={data.city_or_town || ''}
                  onChange={(e) => handleFieldChange('city_or_town', e.target.value)}
                  placeholder="e.g., London"
                />
              </div>
              <div>
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  name="postcode"
                  value={data.postcode || ''}
                  onChange={(e) => handleFieldChange('postcode', e.target.value)}
                  placeholder="e.g., SW1A 1AA"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={data.country || ''}
                  onChange={(e) => handleFieldChange('country', e.target.value)}
                  placeholder="e.g., United Kingdom"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Job Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="job_type">Job Type</Label>
              <Input
                id="job_type"
                name="job_type"
                value={data.job_type || ''}
                onChange={(e) => handleFieldChange('job_type', e.target.value)}
                placeholder="e.g., Healthcare Assistant"
                required
              />
            </div>
            <div>
              <Label htmlFor="job_title">Job Title *</Label>
              <Input
                id="job_title"
                name="job_title"
                value={data.job_title || ''}
                onChange={(e) => handleFieldChange('job_title', e.target.value)}
                placeholder="e.g., Senior Carer"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="gross_salary">Gross Salary (£) *</Label>
              <Input
                id="gross_salary"
                name="gross_salary"
                type="number"
                step="0.01"
                value={data.gross_salary || ''}
                onChange={(e) => handleFieldChange('gross_salary', parseFloat(e.target.value))}
                placeholder="e.g., 25000.00"
                required
              />
            </div>
            <div>
              <Label>Work Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !data.work_start_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.work_start_date 
                      ? format(new Date(data.work_start_date), "dd/MM/yyyy") 
                      : "Select date"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data.work_start_date ? new Date(data.work_start_date) : undefined}
                    onSelect={(date) => handleDateChange('work_start_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Work End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !data.work_end_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.work_end_date 
                      ? format(new Date(data.work_end_date), "dd/MM/yyyy") 
                      : "Select date"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data.work_end_date ? new Date(data.work_end_date) : undefined}
                    onSelect={(date) => handleDateChange('work_end_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save CoS Summary
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}