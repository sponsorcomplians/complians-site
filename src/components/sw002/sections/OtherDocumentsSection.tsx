// src/components/sw002/sections/OtherDocumentsSection.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface OtherDocumentsData {
  sw066_personal_details_background_original?: boolean;
  sw066_personal_details_background_copy?: boolean;
  sw066_date?: string;
  sw067_car_insurance_original?: boolean;
  sw067_car_insurance_copy?: boolean;
  sw067_date?: string;
  sw068_employment_contract_original?: boolean;
  sw068_employment_contract_copy?: boolean;
  sw068_date?: string;
  sw069_vaccination_certificate_original?: boolean;
  sw069_vaccination_certificate_copy?: boolean;
  sw069_date?: string;
  sw070_mot_original?: boolean;
  sw070_mot_copy?: boolean;
  sw070_date?: string;
  sw071_driving_licence_original?: boolean;
  sw071_driving_licence_copy?: boolean;
  sw071_date?: string;
}

interface OtherDocumentsSectionProps {
  data: OtherDocumentsData;
  onChange: (data: OtherDocumentsData) => void;
  onSave: () => void;
}

export default function OtherDocumentsSection({ data, onChange, onSave }: OtherDocumentsSectionProps) {
  const handleFieldChange = (field: keyof OtherDocumentsData, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const documents = [
    {
      code: 'SW066',
      name: 'Personal Details, Background Check and Uniform',
      field: 'sw066',
      description: 'Complete personal information and background verification',
      required: true
    },
    {
      code: 'SW067',
      name: 'Car Insurance',
      field: 'sw067',
      description: 'Valid car insurance for work-related driving',
      required: true
    },
    {
      code: 'SW068',
      name: 'Contract of Employment (Esteemed)',
      field: 'sw068',
      description: 'Employment contract with Esteemed Life Ltd',
      required: true
    },
    {
      code: 'SW069',
      name: 'Vaccination Certificate',
      field: 'sw069',
      description: 'Required vaccinations for healthcare work',
      required: true
    },
    {
      code: 'SW070',
      name: 'MOT',
      field: 'sw070',
      description: 'Valid MOT certificate for work vehicle',
      required: true
    },
    {
      code: 'SW071',
      name: 'Driving License (South African)',
      field: 'sw071',
      description: 'Valid driving license',
      required: true
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Other Documents</CardTitle>
        <CardDescription>
          Additional required documentation for compliance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.code} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">
                    {doc.code} - {doc.name}
                    {doc.required && <span className="text-red-500 ml-1">*</span>}
                  </h4>
                  <p className="text-sm text-muted-foreground">{doc.description}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`${doc.field}_original`}
                      checked={data[`${doc.field}_${doc.field.split('_')[1]}_original`] || false}
                      onCheckedChange={(checked) => 
                        handleFieldChange(`${doc.field}_${doc.field.split('_')[1]}_original` as keyof OtherDocumentsData, checked)
                      }
                    />
                    <Label htmlFor={`${doc.field}_original`} className="text-sm">
                      Original Seen
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`${doc.field}_copy`}
                      checked={data[`${doc.field}_${doc.field.split('_')[1]}_copy`] || false}
                      onCheckedChange={(checked) => 
                        handleFieldChange(`${doc.field}_${doc.field.split('_')[1]}_copy` as keyof OtherDocumentsData, checked)
                      }
                    />
                    <Label htmlFor={`${doc.field}_copy`} className="text-sm">
                      Copy Made
                    </Label>
                  </div>
                </div>
                <div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !data[`${doc.field}_date` as keyof OtherDocumentsData] && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {data[`${doc.field}_date` as keyof OtherDocumentsData]
                          ? format(new Date(data[`${doc.field}_date` as keyof OtherDocumentsData] as string), "dd/MM/yyyy")
                          : "Select date"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={data[`${doc.field}_date` as keyof OtherDocumentsData] ? new Date(data[`${doc.field}_date` as keyof OtherDocumentsData] as string) : undefined}
                        onSelect={(date) => handleFieldChange(`${doc.field}_date` as keyof OtherDocumentsData, date?.toISOString())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Important Notes */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h4 className="font-medium text-blue-800 mb-2">Important Notes:</h4>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>• All documents must be verified against originals</li>
            <li>• Copies must be clear and legible</li>
            <li>• Expiry dates must be monitored for time-sensitive documents</li>
            <li>• Insurance and MOT documents must be kept current</li>
          </ul>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Other Documents
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}