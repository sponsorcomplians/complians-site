"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  Download, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  FileText,
  User,
  Building,
  Shield,
  Calendar,
  CreditCard,
  Eye,
  Copy,
  Signature,
  ChevronDown,
  ChevronUp,
  Info
} from "lucide-react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface SW002FormProps {
  workerId: string;
}

interface FormData {
  // Personal Information
  personalInfo: {
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    passportNumber: string;
    brpNumber: string;
    email: string;
    phone: string;
    address: string;
  };
  
  // CoS Summary
  cosSummary: {
    cosNumber: string;
    cosIssueDate: string;
    cosExpiryDate: string;
    jobTitle: string;
    salary: string;
    workLocation: string;
    sponsorName: string;
    sponsorLicenseNumber: string;
  };
  
  // Advertising & Genuine Vacancy Evidence
  advertising: {
    jobAdvertised: boolean;
    advertStartDate: string;
    advertEndDate: string;
    advertPlatforms: string[];
    advertText: string;
    applicationsReceived: number;
    interviewsConducted: number;
    reasonForNonSelection: string;
    documentsUploaded: string[];
  };
  
  // Resident Labour Market Test (RLMT)
  rlmt: {
    rlmtExempt: boolean;
    exemptionReason: string;
    rlmtCompleted: boolean;
    rlmtStartDate: string;
    rlmtEndDate: string;
    ukWorkersConsidered: number;
    ukWorkersRejected: number;
    rejectionReasons: string;
    documentsUploaded: string[];
  };
  
  // Right to Work & Immigration Status
  rightToWork: {
    rtwCheckCompleted: boolean;
    rtwCheckDate: string;
    rtwMethod: string;
    rtwExpiryDate: string;
    visaType: string;
    visaExpiryDate: string;
    documentsUploaded: string[];
  };
  
  // Criminal Record & Fitness Checks
  criminalChecks: {
    dbsCheckCompleted: boolean;
    dbsCheckDate: string;
    dbsCertificateNumber: string;
    dbsLevel: string;
    dbsResult: string;
    additionalChecks: string;
    documentsUploaded: string[];
  };
  
  // Induction & Training
  induction: {
    inductionCompleted: boolean;
    inductionDate: string;
    inductionTopics: string[];
    trainingRequired: string[];
    trainingCompleted: string[];
    documentsUploaded: string[];
  };
  
  // Occupational Health & Insurance
  occupationalHealth: {
    healthAssessmentCompleted: boolean;
    healthAssessmentDate: string;
    healthAssessmentResult: string;
    insuranceCoverage: boolean;
    insuranceProvider: string;
    insurancePolicyNumber: string;
    insuranceExpiryDate: string;
    documentsUploaded: string[];
  };
  
  // Payment & Contract Terms
  paymentContract: {
    contractSigned: boolean;
    contractStartDate: string;
    contractEndDate: string;
    salaryAgreed: string;
    paymentFrequency: string;
    benefitsProvided: string[];
    probationPeriod: string;
    noticePeriod: string;
    documentsUploaded: string[];
  };
  
  // Ongoing Monitoring & Reviews
  monitoring: {
    firstReviewCompleted: boolean;
    firstReviewDate: string;
    reviewFrequency: string;
    nextReviewDate: string;
    performanceRating: string;
    areasForImprovement: string;
    documentsUploaded: string[];
  };
  
  // Notes / Additional Compliance Commentary
  notes: {
    additionalComments: string;
    complianceIssues: string;
    actionItems: string;
    followUpRequired: boolean;
    followUpDate: string;
  };
  
  // Signature
  signature: {
    signerName: string;
    signerTitle: string;
    signatureDate: string;
    digitalSignature: string;
    submitted: boolean;
  };
}

interface SectionStatus {
  [key: string]: 'complete' | 'pending' | 'missing' | 'not-started';
}

export default function SW002Form({ workerId }: SW002FormProps) {
  const [formData, setFormData] = useState<FormData>({
    personalInfo: {
      fullName: '',
      dateOfBirth: '',
      nationality: '',
      passportNumber: '',
      brpNumber: '',
      email: '',
      phone: '',
      address: '',
    },
    cosSummary: {
      cosNumber: '',
      cosIssueDate: '',
      cosExpiryDate: '',
      jobTitle: '',
      salary: '',
      workLocation: '',
      sponsorName: '',
      sponsorLicenseNumber: '',
    },
    advertising: {
      jobAdvertised: false,
      advertStartDate: '',
      advertEndDate: '',
      advertPlatforms: [],
      advertText: '',
      applicationsReceived: 0,
      interviewsConducted: 0,
      reasonForNonSelection: '',
      documentsUploaded: [],
    },
    rlmt: {
      rlmtExempt: false,
      exemptionReason: '',
      rlmtCompleted: false,
      rlmtStartDate: '',
      rlmtEndDate: '',
      ukWorkersConsidered: 0,
      ukWorkersRejected: 0,
      rejectionReasons: '',
      documentsUploaded: [],
    },
    rightToWork: {
      rtwCheckCompleted: false,
      rtwCheckDate: '',
      rtwMethod: '',
      rtwExpiryDate: '',
      visaType: '',
      visaExpiryDate: '',
      documentsUploaded: [],
    },
    criminalChecks: {
      dbsCheckCompleted: false,
      dbsCheckDate: '',
      dbsCertificateNumber: '',
      dbsLevel: '',
      dbsResult: '',
      additionalChecks: '',
      documentsUploaded: [],
    },
    induction: {
      inductionCompleted: false,
      inductionDate: '',
      inductionTopics: [],
      trainingRequired: [],
      trainingCompleted: [],
      documentsUploaded: [],
    },
    occupationalHealth: {
      healthAssessmentCompleted: false,
      healthAssessmentDate: '',
      healthAssessmentResult: '',
      insuranceCoverage: false,
      insuranceProvider: '',
      insurancePolicyNumber: '',
      insuranceExpiryDate: '',
      documentsUploaded: [],
    },
    paymentContract: {
      contractSigned: false,
      contractStartDate: '',
      contractEndDate: '',
      salaryAgreed: '',
      paymentFrequency: '',
      benefitsProvided: [],
      probationPeriod: '',
      noticePeriod: '',
      documentsUploaded: [],
    },
    monitoring: {
      firstReviewCompleted: false,
      firstReviewDate: '',
      reviewFrequency: '',
      nextReviewDate: '',
      performanceRating: '',
      areasForImprovement: '',
      documentsUploaded: [],
    },
    notes: {
      additionalComments: '',
      complianceIssues: '',
      actionItems: '',
      followUpRequired: false,
      followUpDate: '',
    },
    signature: {
      signerName: '',
      signerTitle: '',
      signatureDate: '',
      digitalSignature: '',
      submitted: false,
    },
  });

  const [activeTab, setActiveTab] = useState('personal');
  const [sectionStatus, setSectionStatus] = useState<SectionStatus>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const supabase = createClientComponentClient();

  const sections = [
    { id: 'personal', title: 'Personal Information', icon: User },
    { id: 'cos', title: 'CoS Summary', icon: FileText },
    { id: 'advertising', title: 'Advertising & Genuine Vacancy', icon: Building },
    { id: 'rlmt', title: 'Resident Labour Market Test', icon: Shield },
    { id: 'rtw', title: 'Right to Work & Immigration', icon: User },
    { id: 'criminal', title: 'Criminal Record & Fitness', icon: Shield },
    { id: 'induction', title: 'Induction & Training', icon: Calendar },
    { id: 'health', title: 'Occupational Health & Insurance', icon: Shield },
    { id: 'payment', title: 'Payment & Contract Terms', icon: CreditCard },
    { id: 'monitoring', title: 'Ongoing Monitoring & Reviews', icon: Calendar },
    { id: 'notes', title: 'Notes & Additional Commentary', icon: FileText },
  ];

  useEffect(() => {
    loadFormData();
    calculateProgress();
  }, [workerId]);

  const loadFormData = async () => {
    try {
      const { data, error } = await supabase
        .from('sw002_forms')
        .select('*')
        .eq('worker_id', workerId)
        .single();

      if (data && !error) {
        setFormData(data.form_data);
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  };

  const saveFormData = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('sw002_forms')
        .upsert({
          worker_id: workerId,
          form_data: formData,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving form data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    const totalFields = Object.keys(formData).length;
    const completedFields = Object.values(formData).filter(section => 
      Object.values(section).some(value => 
        value !== '' && value !== false && value !== 0 && value !== null
      )
    ).length;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  const getSectionStatus = (sectionId: string) => {
    const section = formData[sectionId as keyof FormData] as any;
    if (!section) return 'not-started';
    
    const hasData = Object.values(section).some(value => 
      value !== '' && value !== false && value !== 0 && value !== null
    );
    
    if (hasData) return 'complete';
    return 'pending';
  };

  const handleFileUpload = async (section: string, field: string, file: File) => {
    setUploading(true);
    try {
      const fileName = `${workerId}/${section}/${field}/${file.name}`;
      const { error } = await supabase.storage
        .from('sw002-documents')
        .upload(fileName, file);

      if (error) throw error;

      // Update form data with uploaded file
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof FormData],
          documentsUploaded: [...(prev[section as keyof FormData] as any).documentsUploaded, fileName]
        }
      }));
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const generatePDF = async () => {
    // PDF generation logic will be implemented
    console.log('Generating PDF...');
  };

  const handleSignature = async () => {
    // Digital signature logic will be implemented
    console.log('Handling signature...');
  };

  const progress = calculateProgress();

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-[#00AEEF]">
                SW002 Skilled Worker Coversheet
              </CardTitle>
              <p className="text-gray-600">Compliance documentation for worker ID: {workerId}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={saveFormData} disabled={loading} variant="outline">
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button onClick={generatePDF} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Summary
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">{progress}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Form Sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          {sections.slice(0, 6).map((section) => (
            <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-2">
              <section.icon className="h-4 w-4" />
              {section.title.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsList className="grid w-full grid-cols-5 mb-6">
          {sections.slice(6).map((section) => (
            <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-2">
              <section.icon className="h-4 w-4" />
              {section.title.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#00AEEF]">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.personalInfo.fullName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                    }))}
                    placeholder="Enter full name as per passport"
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.personalInfo.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, dateOfBirth: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="nationality">Nationality *</Label>
                  <Input
                    id="nationality"
                    name="nationality"
                    value={formData.personalInfo.nationality}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, nationality: e.target.value }
                    }))}
                    placeholder="Enter nationality"
                  />
                </div>
                <div>
                  <Label htmlFor="passportNumber">Passport Number *</Label>
                  <Input
                    id="passportNumber"
                    name="passportNumber"
                    value={formData.personalInfo.passportNumber}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, passportNumber: e.target.value }
                    }))}
                    placeholder="Enter passport number"
                  />
                </div>
                <div>
                  <Label htmlFor="brpNumber">BRP Number (if applicable)</Label>
                  <Input
                    id="brpNumber"
                    name="brpNumber"
                    value={formData.personalInfo.brpNumber}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, brpNumber: e.target.value }
                    }))}
                    placeholder="Enter BRP number"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.personalInfo.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, email: e.target.value }
                    }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.personalInfo.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, phone: e.target.value }
                    }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.personalInfo.address}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, address: e.target.value }
                    }))}
                    placeholder="Enter full address"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CoS Summary */}
        <TabsContent value="cos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#00AEEF]">
                <FileText className="h-5 w-5" />
                Certificate of Sponsorship (CoS) Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cosNumber">CoS Number *</Label>
                  <Input
                    id="cosNumber"
                    name="cosNumber"
                    value={formData.cosSummary.cosNumber}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      cosSummary: { ...prev.cosSummary, cosNumber: e.target.value }
                    }))}
                    placeholder="Enter CoS number"
                  />
                </div>
                <div>
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.cosSummary.jobTitle}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      cosSummary: { ...prev.cosSummary, jobTitle: e.target.value }
                    }))}
                    placeholder="Enter job title"
                  />
                </div>
                <div>
                  <Label htmlFor="cosIssueDate">CoS Issue Date *</Label>
                  <Input
                    id="cosIssueDate"
                    name="cosIssueDate"
                    type="date"
                    value={formData.cosSummary.cosIssueDate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      cosSummary: { ...prev.cosSummary, cosIssueDate: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="cosExpiryDate">CoS Expiry Date *</Label>
                  <Input
                    id="cosExpiryDate"
                    name="cosExpiryDate"
                    type="date"
                    value={formData.cosSummary.cosExpiryDate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      cosSummary: { ...prev.cosSummary, cosExpiryDate: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="salary">Salary *</Label>
                  <Input
                    id="salary"
                    name="salary"
                    value={formData.cosSummary.salary}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      cosSummary: { ...prev.cosSummary, salary: e.target.value }
                    }))}
                    placeholder="Enter annual salary"
                  />
                </div>
                <div>
                  <Label htmlFor="workLocation">Work Location *</Label>
                  <Input
                    id="workLocation"
                    name="workLocation"
                    value={formData.cosSummary.workLocation}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      cosSummary: { ...prev.cosSummary, workLocation: e.target.value }
                    }))}
                    placeholder="Enter work location"
                  />
                </div>
                <div>
                  <Label htmlFor="sponsorName">Sponsor Name *</Label>
                  <Input
                    id="sponsorName"
                    name="sponsorName"
                    value={formData.cosSummary.sponsorName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      cosSummary: { ...prev.cosSummary, sponsorName: e.target.value }
                    }))}
                    placeholder="Enter sponsor name"
                  />
                </div>
                <div>
                  <Label htmlFor="sponsorLicenseNumber">Sponsor License Number *</Label>
                  <Input
                    id="sponsorLicenseNumber"
                    name="sponsorLicenseNumber"
                    value={formData.cosSummary.sponsorLicenseNumber}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      cosSummary: { ...prev.cosSummary, sponsorLicenseNumber: e.target.value }
                    }))}
                    placeholder="Enter sponsor license number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advertising & Genuine Vacancy Evidence */}
        <TabsContent value="advertising">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#00AEEF]">
                <Building className="h-5 w-5" />
                Advertising & Genuine Vacancy Evidence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="jobAdvertised"
                  checked={formData.advertising.jobAdvertised}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    advertising: { ...prev.advertising, jobAdvertised: checked as boolean }
                  }))}
                />
                <Label htmlFor="jobAdvertised">Job was advertised in accordance with RLMT requirements</Label>
              </div>

              {formData.advertising.jobAdvertised && (
                <div className="space-y-4 pl-6 border-l-2 border-[#00AEEF]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="advertStartDate">Advertising Start Date *</Label>
                      <Input
                        id="advertStartDate"
                        name="advertStartDate"
                        type="date"
                        value={formData.advertising.advertStartDate}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          advertising: { ...prev.advertising, advertStartDate: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="advertEndDate">Advertising End Date *</Label>
                      <Input
                        id="advertEndDate"
                        name="advertEndDate"
                        type="date"
                        value={formData.advertising.advertEndDate}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          advertising: { ...prev.advertising, advertEndDate: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="advertText">Advertisement Text *</Label>
                    <Textarea
                      id="advertText"
                      value={formData.advertising.advertText}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        advertising: { ...prev.advertising, advertText: e.target.value }
                      }))}
                      placeholder="Paste the full advertisement text here"
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="applicationsReceived">Number of Applications Received</Label>
                      <Input
                        id="applicationsReceived"
                        name="applicationsReceived"
                        type="number"
                        value={formData.advertising.applicationsReceived}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          advertising: { ...prev.advertising, applicationsReceived: parseInt(e.target.value) || 0 }
                        }))}
                        placeholder="Enter number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="interviewsConducted">Number of Interviews Conducted</Label>
                      <Input
                        id="interviewsConducted"
                        name="interviewsConducted"
                        type="number"
                        value={formData.advertising.interviewsConducted}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          advertising: { ...prev.advertising, interviewsConducted: parseInt(e.target.value) || 0 }
                        }))}
                        placeholder="Enter number"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="reasonForNonSelection">Reason for Non-Selection of UK Workers</Label>
                    <Textarea
                      id="reasonForNonSelection"
                      value={formData.advertising.reasonForNonSelection}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        advertising: { ...prev.advertising, reasonForNonSelection: e.target.value }
                      }))}
                      placeholder="Explain why UK workers were not suitable for the role"
                      rows={3}
                    />
                  </div>
                  
                  {/* Document Upload */}
                  <div>
                    <Label>Upload Advertising Evidence</Label>
                    <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="flex items-center justify-center">
                        <Upload className="h-8 w-8 text-gray-400 mr-2" />
                        <span className="text-gray-600">Click to upload or drag and drop</span>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          files.forEach(file => handleFileUpload('advertising', 'documents', file));
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Continue with other sections... */}
        {/* For brevity, I'll show the signature section as the final example */}
        
        {/* Signature Section */}
        <TabsContent value="signature">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#00AEEF]">
                <Signature className="h-5 w-5" />
                Digital Signature & Submission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="signerName">Name of Signatory *</Label>
                  <Input
                    id="signerName"
                    name="signerName"
                    value={formData.signature.signerName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      signature: { ...prev.signature, signerName: e.target.value }
                    }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="signerTitle">Job Title *</Label>
                  <Input
                    id="signerTitle"
                    name="signerTitle"
                    value={formData.signature.signerTitle}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      signature: { ...prev.signature, signerTitle: e.target.value }
                    }))}
                    placeholder="Enter job title"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="signatureDate">Date of Signature *</Label>
                <Input
                  id="signatureDate"
                  name="signatureDate"
                  type="date"
                  value={formData.signature.signatureDate}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    signature: { ...prev.signature, signatureDate: e.target.value }
                  }))}
                />
              </div>
              
              <div>
                <Label>Digital Signature *</Label>
                <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg min-h-[100px] flex items-center justify-center">
                  <Button onClick={handleSignature} variant="outline">
                    <Signature className="h-4 w-4 mr-2" />
                    Click to Sign
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button onClick={saveFormData} variant="outline">
                  Save Draft
                </Button>
                <Button onClick={handleSignature} className="bg-[#00AEEF] hover:bg-[#0098d4]">
                  Sign & Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}