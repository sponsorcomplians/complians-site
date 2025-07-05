// src/components/sw002/sections/PersonalInformationSection.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface PersonalInformationData {
  family_name?: string;
  first_name?: string;
  nationality?: string;
  passport_number?: string;
  place_of_birth?: string;
  country_of_birth?: string;
  date_of_birth?: string;
  country_of_residence?: string;
  gender?: string;
  passport_issue_date?: string;
  passport_expiry_date?: string;
  passport_issue_place?: string;
}

interface PersonalInformationSectionProps {
  data: PersonalInformationData;
  onChange: (data: PersonalInformationData) => void;
  onSave: () => void;
}

export default function PersonalInformationSection({ 
  data, 
  onChange, 
  onSave 
}: PersonalInformationSectionProps) {
  
  const handleFieldChange = (field: keyof PersonalInformationData, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const handleDateChange = (field: keyof PersonalInformationData, date: Date | undefined) => {
    onChange({
      ...data,
      [field]: date ? date.toISOString() : undefined
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Complete all personal details as shown on the passport and other official documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Name Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="family_name">Family Name *</Label>
            <Input
              id="family_name"
              name="family_name"
              value={data.family_name || ''}
              onChange={(e) => handleFieldChange('family_name', e.target.value)}
              placeholder="As shown on passport"
              required
            />
          </div>
          <div>
            <Label htmlFor="first_name">First Name *</Label>
            <Input
              id="first_name"
              name="first_name"
              value={data.first_name || ''}
              onChange={(e) => handleFieldChange('first_name', e.target.value)}
              placeholder="As shown on passport"
              required
            />
          </div>
        </div>

        {/* Nationality and Passport */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nationality">Nationality *</Label>
            <Input
              id="nationality"
              name="nationality"
              value={data.nationality || ''}
              onChange={(e) => handleFieldChange('nationality', e.target.value)}
              placeholder="e.g., Indian"
              required
            />
          </div>
          <div>
            <Label htmlFor="passport_number">Passport Number *</Label>
            <Input
              id="passport_number"
              name="passport_number"
              value={data.passport_number || ''}
              onChange={(e) => handleFieldChange('passport_number', e.target.value)}
              placeholder="e.g., P7179397"
              required
            />
          </div>
        </div>

        {/* Birth Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="place_of_birth">Place of Birth</Label>
            <Input
              id="place_of_birth"
              name="place_of_birth"
              value={data.place_of_birth || ''}
              onChange={(e) => handleFieldChange('place_of_birth', e.target.value)}
              placeholder="City/Town"
            />
          </div>
          <div>
            <Label htmlFor="country_of_birth">Country of Birth</Label>
            <Input
              id="country_of_birth"
              name="country_of_birth"
              value={data.country_of_birth || ''}
              onChange={(e) => handleFieldChange('country_of_birth', e.target.value)}
              placeholder="e.g., India"
            />
          </div>
          <div>
            <Label>Date of Birth *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !data.date_of_birth && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data.date_of_birth 
                    ? format(new Date(data.date_of_birth), "dd/MM/yyyy") 
                    : "Select date"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data.date_of_birth ? new Date(data.date_of_birth) : undefined}
                  onSelect={(date) => handleDateChange('date_of_birth', date)}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Passport Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Passport Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Passport Issue Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !data.passport_issue_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.passport_issue_date 
                      ? format(new Date(data.passport_issue_date), "dd/MM/yyyy") 
                      : "Select date"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data.passport_issue_date ? new Date(data.passport_issue_date) : undefined}
                    onSelect={(date) => handleDateChange('passport_issue_date', date)}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Passport Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !data.passport_expiry_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.passport_expiry_date 
                      ? format(new Date(data.passport_expiry_date), "dd/MM/yyyy") 
                      : "Select date"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data.passport_expiry_date ? new Date(data.passport_expiry_date) : undefined}
                    onSelect={(date) => handleDateChange('passport_expiry_date', date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="passport_issue_place">Place of Issue</Label>
              <Input
                id="passport_issue_place"
                name="passport_issue_place"
                value={data.passport_issue_place || ''}
                onChange={(e) => handleFieldChange('passport_issue_place', e.target.value)}
                placeholder="e.g., Johannesburg"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country_of_residence">Country of Residence</Label>
            <Input
              id="country_of_residence"
              name="country_of_residence"
              value={data.country_of_residence || ''}
              onChange={(e) => handleFieldChange('country_of_residence', e.target.value)}
              placeholder="e.g., United Kingdom"
            />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select 
              value={data.gender || ''} 
              onValueChange={(value) => handleFieldChange('gender', value)}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Personal Information
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}