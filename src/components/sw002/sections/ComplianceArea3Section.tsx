'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface DocumentsPart1Data {
  sw013_passport_original?: boolean;
  sw013_passport_copy?: boolean;
  sw013_date?: string;
  sw014_cos_original?: boolean;
  sw014_cos_copy?: boolean;
  sw014_date?: string;
  sw015_ho_decision_letter_original?: boolean;
  sw015_ho_decision_letter_copy?: boolean;
  sw015_date?: string;
  sw016_visa_vignette_original?: boolean;
  sw016_visa_vignette_copy?: boolean;
  sw016_date?: string;
  sw017_brp_front_original?: boolean;
  sw017_brp_front_copy?: boolean;
  sw017_date?: string;
  sw018_brp_back_ni_original?: boolean;
  sw018_brp_back_ni_copy?: boolean;
  sw018_date?: string;
  sw019_rtw_check_original?: boolean;
  sw019_rtw_check_copy?: boolean;
  sw019_date?: string;
  sw020_dbs_certificate_original?: boolean;
  sw020_dbs_certificate_copy?: boolean;
  sw020_date?: string;
}

interface RecruitmentData {
  applied_to_advertisement?: boolean;
  advert_screenshot_kept?: boolean;
  advert_text_record?: string;
  advert_location?: string;
  advert_duration?: string;
  number_of_applicants?: number;
  number_shortlisted?: number;
  sw021_interview_questions_kept?: boolean;
  sw022_payslips_copies_kept?: boolean;
  sw023_offer_letter_copy?: boolean;
  sw023_date?: string;
  recruitment_method_explanation?: string;
}

interface SalaryData {
  sw024_contract_copy?: boolean;
  sw024_date?: string;
  sw024_contract_signed?: boolean;
  sw025_job_description_copy?: boolean;
  sw025_date?: string;
  sw026_qualifications_copy?: boolean;
  sw026_date?: string;
}

interface SkillsData {
  sw027_references_copy?: boolean;
  sw027_date?: string;
  sw028_english_language_copy?: boolean;
  sw028_date?: string;
  sw028_test_type?: string;
  sw029_police_clearance_copy?: boolean;
  sw029_date?: string;
  sw029_country?: string;
  sw030_medical_certificates_copy?: boolean;
  sw030_date?: string;
}

interface ComplianceArea3SectionProps {
  data: {
    documents_part1: DocumentsPart1Data;
    recruitment: RecruitmentData;
    salary: SalaryData;
    skills: SkillsData;
  };
  onChange: (section: string, data: any) => void;
  onSave: (section: string) => void;
}

export default function ComplianceArea3Section({ data, onChange, onSave }: ComplianceArea3SectionProps) {
  const handleFieldChange = (section: string, field: string, value: any) => {
    onChange(section, {
      ...data[section as keyof typeof data],
      [field]: value
    });
  };

  const documents = [
    { code: 'SW013', name: 'Passport', field: 'sw013_passport', required: true },
    { code: 'SW014', name: 'Certificate of Sponsorship', field: 'sw014_cos', required: true },
    { code: 'SW015', name: 'Home Office Decision Letter', field: 'sw015_ho_decision_letter', required: true },
    { code: 'SW016', name: 'Visa Vignette with entry stamp', field: 'sw016_visa_vignette', required: true },
    { code: 'SW017', name: 'BRP card (front)', field: 'sw017_brp_front', required: true },
    { code: 'SW018', name: 'BRP card (back) showing NI number', field: 'sw018_brp_back_ni', required: true },
    { code: 'SW019', name: 'Right to work online check status', field: 'sw019_rtw_check', required: true },
    { code: 'SW020', name: 'DBS check certificate', field: 'sw020_dbs_certificate', required: false }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>HR & Compliance Area 3</CardTitle>
        <CardDescription>
          Record Keeping & Recruitment Practices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="part1" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="part1">Part 1: Documents</TabsTrigger>
            <TabsTrigger value="part2">Part 2: Recruitment</TabsTrigger>
            <TabsTrigger value="part3">Part 3: Salary</TabsTrigger>
            <TabsTrigger value="part4">Part 4: Skills</TabsTrigger>
          </TabsList>

          {/* Part 1: For each sponsored worker */}
          <TabsContent value="part1" className="space-y-4">
            <h3 className="text-lg font-semibold">Part 1: For each sponsored worker</h3>
            <p className="text-sm text-muted-foreground">
              The following documents must be kept on file for each sponsored worker:
            </p>
            
            <div className="space-y-3">
              {documents.map((doc) => {
                const baseKey = doc.field; // e.g., "sw013_passport"
                const originalKey = `${baseKey}_original` as keyof DocumentsPart1Data;
                const copyKey = `${baseKey}_copy` as keyof DocumentsPart1Data;
                const dateKey = `${doc.field.split('_')[0]}_date` as keyof DocumentsPart1Data;

                return (
                  <div key={doc.code} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">
                          {doc.code} - {doc.name}
                          {doc.required && <span className="text-red-500 ml-1">*</span>}
                        </h4>
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
  id={originalKey}
  checked={Boolean(data.documents_part1[originalKey])}
  onCheckedChange={(checked) => 
    handleFieldChange('documents_part1', originalKey, checked)
  }
/>
<Label htmlFor={originalKey} className="text-sm">
  Original Seen
</Label>
</div>
<div className="flex items-center gap-2">
<Checkbox
  id={copyKey}
  checked={Boolean(data.documents_part1[copyKey])}
  onCheckedChange={(checked) => 
    handleFieldChange('documents_part1', copyKey, checked)
  }
/>
                          <Label htmlFor={copyKey} className="text-sm">
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
                                !data.documents_part1[dateKey] && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {data.documents_part1[dateKey]
                                ? format(new Date(String(data.documents_part1[dateKey])), "dd/MM/yyyy")
                                : "Date seen/copied"
                              }
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={data.documents_part1[dateKey] ? new Date(data.documents_part1[dateKey]) : undefined}
                              onSelect={(date) => handleFieldChange('documents_part1', dateKey, date?.toISOString())}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => onSave('documents_part1')}>
                <Save className="h-4 w-4 mr-2" />
                Save Part 1
              </Button>
            </div>
          </TabsContent>

          {/* Part 2: Evidence of recruitment */}
          <TabsContent value="part2" className="space-y-4">
            <h3 className="text-lg font-semibold">Part 2: Evidence of recruitment for sponsored workers</h3>
            <p className="text-sm text-muted-foreground">
              [Formal RLMT not required] - You must retain evidence of any recruitment activity undertaken.
            </p>
            
            <div className="space-y-4">
              <RadioGroup
                value={data.recruitment.applied_to_advertisement ? 'yes' : 'no'}
                onValueChange={(value) => handleFieldChange('recruitment', 'applied_to_advertisement', value === 'yes')}
              >
                <Label className="font-medium">Did the applicant apply to your advertisement for this job vacancy?</Label>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="advert-yes" />
                  <Label htmlFor="advert-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="advert-no" />
                  <Label htmlFor="advert-no">No</Label>
                </div>
              </RadioGroup>

              {data.recruitment.applied_to_advertisement && (
                <div className="space-y-4 pl-4 border-l-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
  id="advert_screenshot"
  checked={data.recruitment.advert_screenshot_kept ?? false}
  onCheckedChange={(checked) => 
    handleFieldChange('recruitment', 'advert_screenshot_kept', checked)
  }
/>
                    <Label htmlFor="advert_screenshot">
                      Screenshot/printout of advertisement kept
                    </Label>
                  </div>

                  <div>
                    <Label htmlFor="advert_text">Advertisement Text</Label>
                    <Textarea
                      id="advert_text"
                      value={data.recruitment.advert_text_record || ''}
                      onChange={(e) => handleFieldChange('recruitment', 'advert_text_record', e.target.value)}
                      placeholder="Record of the advertisement text"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="advert_location">Where Advertised</Label>
                      <Input
                        id="advert_location"
                        value={data.recruitment.advert_location || ''}
                        onChange={(e) => handleFieldChange('recruitment', 'advert_location', e.target.value)}
                        placeholder="e.g., Indeed, Company Website"
                      />
                    </div>
                    <div>
                      <Label htmlFor="advert_duration">Duration</Label>
                      <Input
                        id="advert_duration"
                        value={data.recruitment.advert_duration || ''}
                        onChange={(e) => handleFieldChange('recruitment', 'advert_duration', e.target.value)}
                        placeholder="e.g., 28 days"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="num_applicants">Number of Applicants</Label>
                      <Input
                        id="num_applicants"
                        type="number"
                        value={data.recruitment.number_of_applicants || ''}
                        onChange={(e) => handleFieldChange('recruitment', 'number_of_applicants', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="num_shortlisted">Number Shortlisted</Label>
                      <Input
                        id="num_shortlisted"
                        type="number"
                        value={data.recruitment.number_shortlisted || ''}
                        onChange={(e) => handleFieldChange('recruitment', 'number_shortlisted', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Additional Evidence</h4>
                    <div className="flex items-center gap-2">
                      <Checkbox
  id="sw021"
  checked={data.recruitment.sw021_interview_questions_kept ?? false}
  onCheckedChange={(checked) => 
    handleFieldChange('recruitment', 'sw021_interview_questions_kept', checked)
  }
/>
<Label htmlFor="sw021">SW021 - Interview Questions kept</Label>
</div>
<div className="flex items-center gap-2">
<Checkbox
  id="sw022"
  checked={data.recruitment.sw022_payslips_copies_kept ?? false}
  onCheckedChange={(checked) => 
    handleFieldChange('recruitment', 'sw022_payslips_copies_kept', checked)
  }
/>
                      <Label htmlFor="sw022">SW022 - Copies of payslips kept</Label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
  id="sw023"
  checked={data.recruitment.sw023_offer_letter_copy ?? false}
  onCheckedChange={(checked) =>
    handleFieldChange('recruitment', 'sw023_offer_letter_copy', checked)
  }
/>
                      <Label htmlFor="sw023">SW023 - Copy of Offer Letter</Label>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "justify-start text-left font-normal",
                            !data.recruitment.sw023_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {data.recruitment.sw023_date
                            ? format(new Date(data.recruitment.sw023_date), "dd/MM/yyyy")
                            : "Date"
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={data.recruitment.sw023_date ? new Date(data.recruitment.sw023_date) : undefined}
                          onSelect={(date) => handleFieldChange('recruitment', 'sw023_date', date?.toISOString())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            )}

            {!data.recruitment.applied_to_advertisement && (
              <div className="space-y-4 pl-4 border-l-2">
                <Label htmlFor="recruitment_method">
                  How did you identify the worker was suitable?
                </Label>
                <Textarea
                  id="recruitment_method"
                  value={data.recruitment.recruitment_method_explanation || ''}
                  onChange={(e) => handleFieldChange('recruitment', 'recruitment_method_explanation', e.target.value)}
                  placeholder="Explain the recruitment method and provide evidence where practicable"
                  rows={4}
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => onSave('recruitment')}>
              <Save className="h-4 w-4 mr-2" />
              Save Part 2
            </Button>
          </div>
        </TabsContent>

        {/* Part 3: Salary of sponsored workers */}
        <TabsContent value="part3" className="space-y-4">
          <h3 className="text-lg font-semibold">Part 3: Salary of sponsored workers</h3>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">SW024 - Copy of any contract of employment</h4>
                  <p className="text-sm text-muted-foreground">
                    Must show names, signatures, dates, job details, hours, and pay
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
  id="sw024_copy"
  checked={data.salary.sw024_contract_copy ?? false}
  onCheckedChange={(checked) => 
    handleFieldChange('salary', 'sw024_contract_copy', checked)
  }
/>
                    <Label htmlFor="sw024_copy" className="text-sm">Copy kept</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
  id="sw024_signed"
  checked={data.salary.sw024_contract_signed ?? false}
  onCheckedChange={(checked) => 
    handleFieldChange('salary', 'sw024_contract_signed', checked)
  }
/>
                    <Label htmlFor="sw024_signed" className="text-sm">Signed by all parties</Label>
                  </div>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !data.salary.sw024_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {data.salary.sw024_date
                        ? format(new Date(data.salary.sw024_date), "dd/MM/yyyy")
                        : "Date"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={data.salary.sw024_date ? new Date(data.salary.sw024_date) : undefined}
                      onSelect={(date) => handleFieldChange('salary', 'sw024_date', date?.toISOString())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">SW025 - A detailed and specific job description</h4>
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
  id="sw025_copy"
  checked={data.salary.sw025_job_description_copy ?? false}
  onCheckedChange={(checked) => 
    handleFieldChange('salary', 'sw025_job_description_copy', checked)
  }
/>
                  <Label htmlFor="sw025_copy" className="text-sm">Copy kept</Label>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !data.salary.sw025_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {data.salary.sw025_date
                        ? format(new Date(data.salary.sw025_date), "dd/MM/yyyy")
                        : "Date"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={data.salary.sw025_date ? new Date(data.salary.sw025_date) : undefined}
                      onSelect={(date) => handleFieldChange('salary', 'sw025_date', date?.toISOString())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">SW026 - A degree or care qualification/training certificate/s</h4>
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
  id="sw026_copy"
  checked={data.salary.sw026_qualifications_copy ?? false}
  onCheckedChange={(checked) => 
    handleFieldChange('salary', 'sw026_qualifications_copy', checked)
  }
/>
                  <Label htmlFor="sw026_copy" className="text-sm">Copy kept</Label>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !data.salary.sw026_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {data.salary.sw026_date
                        ? format(new Date(data.salary.sw026_date), "dd/MM/yyyy")
                        : "Date"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={data.salary.sw026_date ? new Date(data.salary.sw026_date) : undefined}
                      onSelect={(date) => handleFieldChange('salary', 'sw026_date', date?.toISOString())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => onSave('salary')}>
              <Save className="h-4 w-4 mr-2" />
              Save Part 3
            </Button>
          </div>
        </TabsContent>

        {/* Part 4: Skill level for sponsored workers */}
        <TabsContent value="part4" className="space-y-4">
          <h3 className="text-lg font-semibold">Part 4: Skill level for sponsored workers</h3>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">SW027 - References from a previous employer or other evidence of experience</h4>
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
  id="sw027_copy"
  checked={data.skills.sw027_references_copy ?? false}
  onCheckedChange={(checked) => 
    handleFieldChange('skills', 'sw027_references_copy', checked)
  }
/>
                  <Label htmlFor="sw027_copy" className="text-sm">Copy kept</Label>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !data.skills.sw027_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {data.skills.sw027_date
                        ? format(new Date(data.skills.sw027_date), "dd/MM/yyyy")
                        : "Date"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={data.skills.sw027_date ? new Date(data.skills.sw027_date) : undefined}
                      onSelect={(date) => handleFieldChange('skills', 'sw027_date', date?.toISOString())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">SW028 - IELTS UKVI or any evidence of passing the English Language requirement</h4>
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sw028_test_type">Test Type</Label>
                  <Input
                    id="sw028_test_type"
                    value={data.skills.sw028_test_type || ''}
                    onChange={(e) => handleFieldChange('skills', 'sw028_test_type', e.target.value)}
                    placeholder="e.g., IELTS UKVI"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
  id="sw028_copy"
  checked={data.skills.sw028_english_language_copy ?? false}
  onCheckedChange={(checked) => 
    handleFieldChange('skills', 'sw028_english_language_copy', checked)
  }
/>
                  <Label htmlFor="sw028_copy" className="text-sm">Copy kept</Label>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !data.skills.sw028_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {data.skills.sw028_date
                        ? format(new Date(data.skills.sw028_date), "dd/MM/yyyy")
                        : "Date"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={data.skills.sw028_date ? new Date(data.skills.sw028_date) : undefined}
                      onSelect={(date) => handleFieldChange('skills', 'sw028_date', date?.toISOString())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">SW029 - Police Clearance from Home Country</h4>
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sw029_country">Country</Label>
                  <Input id="sw029_country"
                    value={data.skills.sw029_country || ''}
                    onChange={(e) => handleFieldChange('skills', 'sw029_country', e.target.value)}
                    placeholder="e.g., India"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
  id="sw029_copy"
  checked={data.skills.sw029_police_clearance_copy ?? false}
  onCheckedChange={(checked) => 
    handleFieldChange('skills', 'sw029_police_clearance_copy', checked)
  }
/>
                  <Label htmlFor="sw029_copy" className="text-sm">Copy kept</Label>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !data.skills.sw029_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {data.skills.sw029_date
                        ? format(new Date(data.skills.sw029_date), "dd/MM/yyyy")
                        : "Date"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={data.skills.sw029_date ? new Date(data.skills.sw029_date) : undefined}
                      onSelect={(date) => handleFieldChange('skills', 'sw029_date', date?.toISOString())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">SW030 - Medical Test Certificates</h4>
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
  id="sw030_copy"
  checked={data.skills.sw030_medical_certificates_copy ?? false}
  onCheckedChange={(checked) => 
    handleFieldChange('skills', 'sw030_medical_certificates_copy', checked)
  }
/>
                  <Label htmlFor="sw030_copy" className="text-sm">Copy kept</Label>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !data.skills.sw030_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {data.skills.sw030_date
                        ? format(new Date(data.skills.sw030_date), "dd/MM/yyyy")
                        : "Date"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={data.skills.sw030_date ? new Date(data.skills.sw030_date) : undefined}
                      onSelect={(date) => handleFieldChange('skills', 'sw030_date', date?.toISOString())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => onSave('skills')}>
              <Save className="h-4 w-4 mr-2" />
              Save Part 4
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
);
}