// src/components/sw002/sections/ComplianceArea2Section.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, FileText, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ContactDetailsData {
  sw010_proof_address_1_original?: boolean;
  sw010_proof_address_1_copy?: boolean;
  sw010_date?: string;
  sw010_document_type?: string;
  sw011_proof_address_2_original?: boolean;
  sw011_proof_address_2_copy?: boolean;
  sw011_date?: string;
  sw011_document_type?: string;
  sw012_application_form_original?: boolean;
  sw012_application_form_copy?: boolean;
  sw012_date?: string;
  contact_info_matches_proof?: boolean;
  two_address_proofs_provided?: boolean;
  address_history_maintained?: boolean;
  change_of_contact_form_used?: boolean;
}

interface ComplianceArea2SectionProps {
  data: ContactDetailsData;
  onChange: (data: ContactDetailsData) => void;
  onSave: (section: string) => void;
}

export default function ComplianceArea2Section({ data, onChange, onSave }: ComplianceArea2SectionProps) {
  const handleFieldChange = (field: keyof ContactDetailsData, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>HR & Compliance Area 2</CardTitle>
          <CardDescription>
            Maintaining Migrant Contact Details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="border-yellow-200 bg-yellow-50">
            <FileText className="h-4 w-4" />
            <CardContent className="pt-4">
              You must ensure that contact information matches proof of address documents and maintain a complete address history.
            </CardContent>
          </Card>

          {/* Document Checklist */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Required Documents</h3>
            
            {/* SW010 - Proof of Address 1 */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">SW010 - Proof of Address (1)</h4>
                  <p className="text-sm text-muted-foreground">Primary address verification document</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sw010_type">Document Type</Label>
                  <Input
                    id="sw010_type"
                    value={data.sw010_document_type || ''}
                    onChange={(e) => handleFieldChange('sw010_document_type', e.target.value)}
                    placeholder="e.g., Bank Statement"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="sw010_original"
                      checked={data.sw010_proof_address_1_original || false}
                      onCheckedChange={(checked) => 
                        handleFieldChange('sw010_proof_address_1_original', checked)
                      }
                    />
                    <Label htmlFor="sw010_original" className="text-sm">
                      Original Seen
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="sw010_copy"
                      checked={data.sw010_proof_address_1_copy || false}
                      onCheckedChange={(checked) => 
                        handleFieldChange('sw010_proof_address_1_copy', checked)
                      }
                    />
                    <Label htmlFor="sw010_copy" className="text-sm">
                      Copy Made
                    </Label>
                  </div>
                </div>
                <div>
                  <Label>Date Verified</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !data.sw010_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {data.sw010_date 
                          ? format(new Date(data.sw010_date), "dd/MM/yyyy") 
                          : "Select date"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={data.sw010_date ? new Date(data.sw010_date) : undefined}
                        onSelect={(date) => handleFieldChange('sw010_date', date?.toISOString())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* SW011 - Proof of Address 2 */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">SW011 - Proof of Address (2)</h4>
                  <p className="text-sm text-muted-foreground">Secondary address verification document (optional)</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sw011_type">Document Type</Label>
                  <Input
                    id="sw011_type"
                    value={data.sw011_document_type || ''}
                    onChange={(e) => handleFieldChange('sw011_document_type', e.target.value)}
                    placeholder="e.g., Utility Bill"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="sw011_original"
                      checked={data.sw011_proof_address_2_original || false}
                      onCheckedChange={(checked) => 
                        handleFieldChange('sw011_proof_address_2_original', checked)
                      }
                    />
                    <Label htmlFor="sw011_original" className="text-sm">
                      Original Seen
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="sw011_copy"
                      checked={data.sw011_proof_address_2_copy || false}
                      onCheckedChange={(checked) => 
                        handleFieldChange('sw011_proof_address_2_copy', checked)
                      }
                    />
                    <Label htmlFor="sw011_copy" className="text-sm">
                      Copy Made
                    </Label>
                  </div>
                </div>
                <div>
                  <Label>Date Verified</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !data.sw011_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {data.sw011_date 
                          ? format(new Date(data.sw011_date), "dd/MM/yyyy") 
                          : "Select date"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={data.sw011_date ? new Date(data.sw011_date) : undefined}
                        onSelect={(date) => handleFieldChange('sw011_date', date?.toISOString())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* SW012 - Application Form */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">SW012 - SW Job Application/Sponsorship Application Form</h4>
                  <p className="text-sm text-muted-foreground">Original application form with contact details</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="sw012_original"
                      checked={data.sw012_application_form_original || false}
                      onCheckedChange={(checked) => 
                        handleFieldChange('sw012_application_form_original', checked)
                      }
                    />
                    <Label htmlFor="sw012_original" className="text-sm">
                      Original Seen
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="sw012_copy"
                      checked={data.sw012_application_form_copy || false}
                      onCheckedChange={(checked) => 
                        handleFieldChange('sw012_application_form_copy', checked)
                      }
                    />
                    <Label htmlFor="sw012_copy" className="text-sm">
                      Copy Made
                    </Label>
                  </div>
                </div>
                <div>
                  <Label>Date Verified</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !data.sw012_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {data.sw012_date 
                          ? format(new Date(data.sw012_date), "dd/MM/yyyy") 
                          : "Select date"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={data.sw012_date ? new Date(data.sw012_date) : undefined}
                        onSelect={(date) => handleFieldChange('sw012_date', date?.toISOString())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>

          {/* Best Practice Checklist */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Best Practice Requirements</h3>
            <div className="space-y-3 pl-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="contact_matches"
                  checked={data.contact_info_matches_proof || false}
                  onCheckedChange={(checked) => 
                    handleFieldChange('contact_info_matches_proof', checked)
                  }
                />
                <Label htmlFor="contact_matches">
                  Contact information on application form matches proof of address
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="two_proofs"
                  checked={data.two_address_proofs_provided || false}
                  onCheckedChange={(checked) => 
                    handleFieldChange('two_address_proofs_provided', checked)
                  }
                />
                <Label htmlFor="two_proofs">
                  At least two documents provided to evidence current address
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="address_history"
                  checked={data.address_history_maintained || false}
                  onCheckedChange={(checked) => 
                    handleFieldChange('address_history_maintained', checked)
                  }
                />
                <Label htmlFor="address_history">
                  Address history record maintained and coversheet updated with current address
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="change_form"
                  checked={data.change_of_contact_form_used || false}
                  onCheckedChange={(checked) => 
                    handleFieldChange('change_of_contact_form_used', checked)
                  }
                />
                <Label htmlFor="change_form">
                  'Change of Contact Form' process established for address changes
                </Label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={onSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Contact Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
