// src/components/sw002/sections/ComplianceArea4Section.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, FileText, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface MigrantTrackingData {
  sw031_next_of_kin_original?: boolean;
  sw031_next_of_kin_copy?: boolean;
  sw031_date?: string;
  sw032_change_contact_form_original?: boolean;
  sw032_change_contact_form_copy?: boolean;
  sw032_date?: string;
  sw033_address_history_original?: boolean;
  sw033_address_history_copy?: boolean;
  sw033_date?: string;
  sw034_absence_record_original?: boolean;
  sw034_absence_record_copy?: boolean;
  sw034_date?: string;
  sw035_annual_leave_form_original?: boolean;
  sw035_annual_leave_form_copy?: boolean;
  sw035_date?: string;
  sw036_activity_report_original?: boolean;
  sw036_activity_report_copy?: boolean;
  sw036_date?: string;
}

interface ComplianceArea4SectionProps {
  data: MigrantTrackingData;
  onChange: (data: MigrantTrackingData) => void;
  onSave: (section: string) => void;
}

export default function ComplianceArea4Section({ data, onChange, onSave }: ComplianceArea4SectionProps) {
  const handleFieldChange = (field: keyof MigrantTrackingData, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const documents = [
    { 
      code: 'SW031', 
      name: 'Next of Kin', 
      field: 'sw031',
      description: 'Emergency contact information',
      required: true 
    },
    { 
      code: 'SW032', 
      name: 'Change of Contact Form', 
      field: 'sw032',
      description: 'Used when worker changes address or contact details',
      required: false 
    },
    { 
      code: 'SW033', 
      name: 'Address History Form', 
      field: 'sw033',
      description: 'Complete record of all addresses',
      required: true 
    },
    { 
      code: 'SW034', 
      name: 'Absence/s Record Form', 
      field: 'sw034',
      description: 'Track unauthorized absences',
      required: false 
    },
    { 
      code: 'SW035', 
      name: 'Annual Leave Form', 
      field: 'sw035',
      description: 'Record of leave taken',
      required: false 
    },
    { 
      code: 'SW036', 
      name: 'SW Migrant\'s Activity Report', 
      field: 'sw036',
      description: 'Regular activity reporting',
      required: true 
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>HR & Compliance Area 4</CardTitle>
        <CardDescription>
          Migrant Tracking & Monitoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Required Documents</h3>
          <p className="text-sm text-muted-foreground">
            The following documents must be maintained to track and monitor sponsored workers:
          </p>
          
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
                        checked={data[`${doc.field}_${doc.field.includes('form') ? doc.field.split('_')[1] : doc.field.split('_')[1]}_original`] || false}
                        onCheckedChange={(checked) => 
                          handleFieldChange(`${doc.field}_${doc.field.includes('form') ? doc.field.split('_')[1] : doc.field.split('_')[1]}_original`, checked)
                        }
                      />
                      <Label htmlFor={`${doc.field}_original`} className="text-sm">
                        Original Seen
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`${doc.field}_copy`}
                        checked={data[`${doc.field}_${doc.field.includes('form') ? doc.field.split('_')[1] : doc.field.split('_')[1]}_copy`] || false}
                        onCheckedChange={(checked) => 
                          handleFieldChange(`${doc.field}_${doc.field.includes('form') ? doc.field.split('_')[1] : doc.field.split('_')[1]}_copy`, checked)
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
                            !data[`${doc.field}_date`] && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {data[`${doc.field}_date`]
                            ? format(new Date(data[`${doc.field}_date`]), "dd/MM/yyyy")
                            : "Select date"
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={data[`${doc.field}_date`] ? new Date(data[`${doc.field}_date`]) : undefined}
                          onSelect={(date) => handleFieldChange(`${doc.field}_date`, date?.toISOString())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Practice Requirements */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Best Practice Requirements</h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Important Reminders:</h4>
            <ul className="space-y-1 text-sm text-yellow-700">
              <li>â€¢ You must keep a record of the migrant's address history</li>
              <li>â€¢ You must ask the migrant to complete the 'Change of Contact Form' after moving to a new address</li>
              <li>â€¢ All contact details must be kept up to date in the system</li>
              <li>â€¢ Regular activity reports must be submitted as required</li>
            </ul>
          </div>
        </div>

        {/* Reporting Duties Reminder */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Reporting Duties</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">
              Changes you must report within 10 working days:
            </h4>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>â€¢ Sponsored worker does not start within 28 days</li>
              <li>â€¢ Absent without permission for more than 10 consecutive working days</li>
              <li>â€¢ Absent without pay for more than 4 weeks total in any calendar year</li>
              <li>â€¢ Salary reduced from the level stated on their CoS</li>
              <li>â€¢ Significant changes to employment details</li>
              <li>â€¢ Normal work location changes</li>
              <li>â€¢ You stop sponsoring a worker for any reason</li>
            </ul>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Migrant Tracking
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
