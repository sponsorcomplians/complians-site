// src/components/sw002/sections/PersonalInformationSection.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, User, Info } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Textarea } from "@/components/ui/textarea";

interface PersonalInfo {
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  brpNumber: string;
  email: string;
  phone: string;
  address: string;
}

interface PersonalInformationSectionProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export default function PersonalInformationSection({ data, onChange }: PersonalInformationSectionProps) {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#00AEEF]">
          <User className="h-5 w-5" />
          Personal Information
          <div className="flex items-center gap-1 ml-2">
            <Info className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">Paragraph C1.38</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              name="fullName"
              value={data.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="Enter full name as per passport"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={data.dateOfBirth}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="nationality">Nationality *</Label>
            <Input
              id="nationality"
              name="nationality"
              value={data.nationality}
              onChange={(e) => handleChange('nationality', e.target.value)}
              placeholder="Enter nationality"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="passportNumber">Passport Number *</Label>
            <Input
              id="passportNumber"
              name="passportNumber"
              value={data.passportNumber}
              onChange={(e) => handleChange('passportNumber', e.target.value)}
              placeholder="Enter passport number"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="brpNumber">BRP Number (if applicable)</Label>
            <Input
              id="brpNumber"
              name="brpNumber"
              value={data.brpNumber}
              onChange={(e) => handleChange('brpNumber', e.target.value)}
              placeholder="Enter BRP number"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter email address"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={data.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Enter phone number"
              className="mt-1"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={data.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Enter full address"
              rows={3}
              className="mt-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}