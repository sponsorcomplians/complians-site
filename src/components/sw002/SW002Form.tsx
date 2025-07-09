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
  rightToWork: {
    rtwCheckCompleted: boolean;
    rtwCheckDate: string;
    rtwMethod: string;
    rtwExpiryDate: string;
    visaType: string;
    visaExpiryDate: string;
    documentsUploaded: string[];
  };
  criminalChecks: {
    dbsCheckCompleted: boolean;
    dbsCheckDate: string;
    dbsCertificateNumber: string;
    dbsLevel: string;
    dbsResult: string;
    additionalChecks: string;
    documentsUploaded: string[];
  };
  induction: {
    inductionCompleted: boolean;
    inductionDate: string;
    inductionTopics: string[];
    trainingRequired: string[];
    trainingCompleted: string[];
    documentsUploaded: string[];
  };
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
  monitoring: {
    firstReviewCompleted: boolean;
    firstReviewDate: string;
    reviewFrequency: string;
    nextReviewDate: string;
    performanceRating: string;
    areasForImprovement: string;
    documentsUploaded: string[];
  };
  notes: {
    additionalComments: string;
    complianceIssues: string;
    actionItems: string;
    followUpRequired: boolean;
    followUpDate: string;
  };
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
    { id: 'area1', title: 'HR & Compliance Area 1', icon: Shield },
    { id: 'area2', title: 'HR & Compliance Area 2', icon: Shield },
    { id: 'area3', title: 'HR & Compliance Area 3', icon: Shield },
    { id: 'area4', title: 'HR & Compliance Area 4', icon: Shield },
    { id: 'reporting', title: 'Reporting Duties', icon: FileText },
    { id: 'qualifications', title: 'Qualifications', icon: FileText },
    { id: 'skills', title: 'Skills and Experience', icon: FileText },
    { id: 'others', title: 'Others', icon: FileText },
    { id: 'notes', title: 'Notes', icon: FileText },
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
    console.log('Generating PDF...');
  };

  const handleSignature = async () => {
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

      {/* Name of Sponsored Worker field */}
      <div className="w-full">
        <Label htmlFor="sponsoredWorkerName" className="text-lg font-semibold text-[#00AEEF]">
          Name of Sponsored Worker
        </Label>
        <Input
          id="sponsoredWorkerName"
          name="sponsoredWorkerName"
          value={formData.personalInfo.fullName}
          className="mt-2 text-lg font-medium"
          readOnly
        />
      </div>

      {/* Form Sections */}
      <Card className="w-full bg-white rounded-xl shadow p-4">
        <div className="w-full flex flex-col items-center">
          <div className="w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="w-full">
                <div className="grid grid-cols-6 w-full bg-[#002B45] rounded-t-xl overflow-hidden">
                  {sections.slice(0, 6).map((section, idx) => (
                    <TabsTrigger
                      key={section.id}
                      value={section.id}
                      className={`flex items-center justify-center gap-2 px-2 py-4 text-base font-bold border-r border-white/20 transition-all h-14
                        ${idx === 0 ? 'rounded-tl-xl' : ''}
                        ${idx === 5 ? 'rounded-tr-xl' : ''}
                        bg-[#002B45] text-white
                        data-[state=active]:bg-white data-[state=active]:text-[#005B8C]
                      `}
                      style={{ minWidth: 0 }}
                    >
                      <section.icon className="h-5 w-5" />
                      {section.title}
                    </TabsTrigger>
                  ))}
                </div>
                <div className="grid grid-cols-5 w-full bg-[#002B45] rounded-b-xl overflow-hidden border-t-2 border-white/20">
                  {sections.slice(6).map((section, idx) => (
                    <TabsTrigger
                      key={section.id}
                      value={section.id}
                      className={`flex items-center justify-center gap-2 px-2 py-4 text-base font-bold border-r border-white/20 transition-all h-14
                        ${idx === 0 ? 'rounded-bl-xl' : ''}
                        ${idx === 4 ? 'rounded-br-xl' : ''}
                        bg-[#002B45] text-white
                        data-[state=active]:bg-white data-[state=active]:text-[#005B8C]
                      `}
                      style={{ minWidth: 0 }}
                    >
                      <section.icon className="h-5 w-5" />
                      {section.title}
                    </TabsTrigger>
                  ))}
                </div>
              </div>

              {/* Informational Text Box - moved below tabs */}
              <div className="border border-[#00AEEF] bg-[#F9FAFB] rounded-lg p-3 my-4 text-sm text-[#00AEEF] font-normal w-full">
                <span className="">Sponsorship is a privilege not a right. Significant trust is placed in sponsors and they must ensure they comply with immigration law and wider UK law, and not behave in a manner that is not conducive to the wider public good.</span>
              </div>

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

              <TabsContent value="cos">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#00AEEF]">
                      <FileText className="h-5 w-5" />
                      CoS Summary
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

              <TabsContent value="area1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#00AEEF]">
                      <Shield className="h-5 w-5" />
                      HR & Compliance Area 1
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Content for HR & Compliance Area 1 will be implemented here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="area2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#00AEEF]">
                      <Shield className="h-5 w-5" />
                      HR & Compliance Area 2
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Content for HR & Compliance Area 2 will be implemented here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="area3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#00AEEF]">
                      <Shield className="h-5 w-5" />
                      HR & Compliance Area 3
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Content for HR & Compliance Area 3 will be implemented here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="area4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#00AEEF]">
                      <Shield className="h-5 w-5" />
                      HR & Compliance Area 4
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Content for HR & Compliance Area 4 will be implemented here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reporting">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#00AEEF]">
                      <FileText className="h-5 w-5" />
                      Reporting Duties
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Content for Reporting Duties will be implemented here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="qualifications">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#00AEEF]">
                      <FileText className="h-5 w-5" />
                      Qualifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Content for Qualifications will be implemented here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#00AEEF]">
                      <FileText className="h-5 w-5" />
                      Skills and Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Content for Skills and Experience will be implemented here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="others">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#00AEEF]">
                      <FileText className="h-5 w-5" />
                      Others
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Content for Others will be implemented here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#00AEEF]">
                      <FileText className="h-5 w-5" />
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Content for Notes will be implemented here.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Card>
    </div>
  );
}