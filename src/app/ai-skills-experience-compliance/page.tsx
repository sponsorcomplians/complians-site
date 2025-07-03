'use client'

import { useState, useEffect } from "react";
import { GraduationCap, Users, CheckCircle, AlertTriangle, Clock, Bot, Upload, FileText, MessageSquare, Send, User, Lightbulb, BookOpen, Target, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Worker {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  department?: string;
  start_date: string;
  compliance_status?: string;
  compliance_score?: number;
  skills_assessment_date?: string;
  experience_verification_date?: string;
  cv_analysis_date?: string;
}

interface SkillsAssessment {
  id: string;
  worker_id: string;
  assessment_date: string;
  skills_verified: string[];
  skills_gaps: string[];
  certifications: string[];
  assessment_score: number;
  compliance_status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING';
  notes: string;
}

interface ExperienceVerification {
  id: string;
  worker_id: string;
  verification_date: string;
  experience_verified: boolean;
  years_experience: number;
  relevant_experience: string[];
  references_checked: boolean;
  compliance_status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING';
  notes: string;
}

interface CVAnalysis {
  id: string;
  worker_id: string;
  analysis_date: string;
  cv_score: number;
  improvements_suggested: string[];
  accuracy_verified: boolean;
  compliance_status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING';
  notes: string;
}

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "skills-assessment", label: "Skills Assessment" },
  { id: "experience-verification", label: "Experience Verification" },
  { id: "cv-analysis", label: "CV Analysis" },
  { id: "ai-assistant", label: "AI Assistant" },
];

function FileUploadSection({ label, onAssessmentComplete }: { label: string; onAssessmentComplete: (assessment: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setParsed(null);
    if (f) {
      setLoading(true);
      // Simulate parsing delay
      setTimeout(() => {
        let assessmentData: any = {
          assessment_date: new Date().toISOString(),
          compliance_status: 'COMPLIANT' as const,
          notes: `Simulated assessment for ${label}`
        };
        
        if (label === 'Skills Assessment') {
          assessmentData.skills_verified = ['JavaScript', 'React', 'Node.js', 'Python'];
          assessmentData.skills_gaps = ['AWS', 'Docker'];
          assessmentData.certifications = ['AWS Certified Developer', 'Google Cloud Professional'];
          assessmentData.assessment_score = 85;
        } else if (label === 'Experience Verification') {
          assessmentData.experience_verified = true;
          assessmentData.years_experience = 3;
          assessmentData.relevant_experience = ['Software Development', 'Team Leadership'];
          assessmentData.references_checked = true;
        } else if (label === 'CV Analysis') {
          assessmentData.cv_score = 88;
          assessmentData.improvements_suggested = ['Add more specific achievements', 'Include metrics'];
          assessmentData.accuracy_verified = true;
        }
        
        setParsed(`Simulated extracted data from "${f.name}".\n\nAssessment completed successfully.`);
        setLoading(false);
        onAssessmentComplete(assessmentData);
      }, 1200);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Upload className="h-5 w-5 text-[#263976]" />
        Upload {label} Document
      </h3>
      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileChange}
        className="mb-4"
      />
      {file && (
        <div className="mb-2 text-sm text-gray-700">Selected: <span className="font-medium">{file.name}</span></div>
      )}
      {loading && <div className="text-blue-600 text-sm">Parsing document...</div>}
      {parsed && (
        <div className="mt-4 p-4 bg-gray-50 border rounded text-sm whitespace-pre-wrap text-gray-800">
          {parsed}
        </div>
      )}
      {!file && <div className="text-gray-500 text-sm">Accepted formats: PDF, DOC, DOCX, TXT</div>}
    </div>
  );
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ComplianceGuidance {
  id: string;
  title: string;
  description: string;
  category: 'skills' | 'experience' | 'documentation' | 'compliance';
  priority: 'high' | 'medium' | 'low';
}

export default function AISkillsExperienceCompliancePage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [skillsAssessments, setSkillsAssessments] = useState<SkillsAssessment[]>([]);
  const [experienceVerifications, setExperienceVerifications] = useState<ExperienceVerification[]>([]);
  const [cvAnalyses, setCvAnalyses] = useState<CVAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your Skills & Experience Compliance Assistant. I can help you with:\n\n• Skills assessment and verification\n• Experience validation and documentation\n• CV analysis and improvement\n• Compliance guidance and best practices\n\nHow can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const supabase = createClientComponentClient();

  // Fetch workers from database
  useEffect(() => {
    async function fetchWorkers() {
      try {
        const { data, error } = await supabase
          .from('workers')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching workers:', error);
        } else {
          setWorkers(data || []);
        }
      } catch (error) {
        console.error('Error fetching workers:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkers();
  }, [supabase]);

  // Calculate dashboard stats
  const dashboardStats = {
    totalWorkers: workers.length,
    skillsAssessed: workers.filter(w => w.skills_assessment_date).length,
    experienceVerified: workers.filter(w => w.experience_verification_date).length,
    cvAnalyzed: workers.filter(w => w.cv_analysis_date).length,
    compliantWorkers: workers.filter(w => w.compliance_status === 'COMPLIANT').length,
    pendingReviews: workers.filter(w => !w.skills_assessment_date || !w.experience_verification_date || !w.cv_analysis_date).length,
    complianceRate: workers.length > 0 ? Math.round((workers.filter(w => w.compliance_status === 'COMPLIANT').length / workers.length) * 100) : 0
  };

  const complianceGuidance: ComplianceGuidance[] = [
    {
      id: '1',
      title: 'Skills Verification Process',
      description: 'Ensure all claimed skills are properly documented and verifiable through certificates, training records, or practical assessments.',
      category: 'skills',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Experience Documentation',
      description: 'Maintain detailed records of work experience including dates, roles, responsibilities, and achievements.',
      category: 'experience',
      priority: 'high'
    },
    {
      id: '3',
      title: 'CV Best Practices',
      description: 'Ensure CVs are accurate, up-to-date, and include all relevant qualifications and experience.',
      category: 'documentation',
      priority: 'medium'
    },
    {
      id: '4',
      title: 'Compliance Monitoring',
      description: 'Regularly review and update skills and experience records to maintain compliance with immigration requirements.',
      category: 'compliance',
      priority: 'high'
    }
  ];

  const handleAssessmentComplete = async (assessmentData: any) => {
    // In a real implementation, this would save to the database
    console.log('Assessment completed:', assessmentData);
    
    // Update local state for demo purposes
    if (assessmentData.skills_verified) {
      setSkillsAssessments(prev => [...prev, assessmentData]);
    } else if (assessmentData.experience_verified !== undefined) {
      setExperienceVerifications(prev => [...prev, assessmentData]);
    } else if (assessmentData.cv_score) {
      setCvAnalyses(prev => [...prev, assessmentData]);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: newMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(newMessage),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('skill') || lowerMessage.includes('qualification')) {
      return 'For skills verification, I recommend:\n\n1. Document all claimed skills with certificates or training records\n2. Conduct practical assessments where possible\n3. Maintain a skills matrix for each worker\n4. Regular skills audits every 6 months\n\nWould you like me to help you create a skills verification checklist?';
    }
    
    if (lowerMessage.includes('experience') || lowerMessage.includes('work history')) {
      return 'For experience validation:\n\n1. Collect detailed employment references\n2. Verify dates and roles with previous employers\n3. Document specific responsibilities and achievements\n4. Keep copies of employment contracts and payslips\n\nI can help you create an experience verification template if needed.';
    }
    
    if (lowerMessage.includes('cv') || lowerMessage.includes('resume')) {
      return 'CV analysis best practices:\n\n1. Ensure all information is accurate and up-to-date\n2. Include specific achievements and metrics\n3. Verify all dates and employment details\n4. Check for consistency across all documents\n\nWould you like me to analyze a specific CV or create a CV template?';
    }
    
    if (lowerMessage.includes('compliance') || lowerMessage.includes('requirement')) {
      return 'Key compliance requirements for skills and experience:\n\n1. Maintain accurate records for all workers\n2. Regular audits of skills and experience claims\n3. Document verification processes\n4. Keep records for minimum 2 years after worker leaves\n\nI can provide a detailed compliance checklist for your specific needs.';
    }
    
    return 'I understand you\'re asking about skills and experience compliance. Could you please provide more specific details about what you need help with? I can assist with skills verification, experience validation, CV analysis, or compliance requirements.';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'skills': return <Target className="w-4 h-4" />;
      case 'experience': return <Award className="w-4 h-4" />;
      case 'documentation': return <FileText className="w-4 h-4" />;
      case 'compliance': return <CheckCircle className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#263976] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Skills & Experience Compliance
          </h1>
          <p className="text-gray-600">
            Intelligent skills assessment, experience verification, and compliance monitoring
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="skills-assessment">Skills Assessment</TabsTrigger>
            <TabsTrigger value="experience-verification">Experience Verification</TabsTrigger>
            <TabsTrigger value="cv-analysis">CV Analysis</TabsTrigger>
            <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalWorkers}</div>
                  <p className="text-xs text-muted-foreground">
                    Active workers in system
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Skills Assessed</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.skillsAssessed}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats.totalWorkers > 0 ? Math.round((dashboardStats.skillsAssessed / dashboardStats.totalWorkers) * 100) : 0}% completion rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Experience Verified</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.experienceVerified}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats.totalWorkers > 0 ? Math.round((dashboardStats.experienceVerified / dashboardStats.totalWorkers) * 100) : 0}% completion rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.complianceRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    Overall compliance score
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workers Overview</CardTitle>
                  <CardDescription>
                    Recent workers and their compliance status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {workers.slice(0, 5).map((worker) => (
                      <div key={worker.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{worker.first_name} {worker.last_name}</h4>
                          <p className="text-sm text-gray-600">{worker.role}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={worker.compliance_status === 'COMPLIANT' ? 'default' : 'destructive'}>
                            {worker.compliance_status || 'PENDING'}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {worker.skills_assessment_date ? 'Skills ✓' : 'Skills ✗'} | 
                            {worker.experience_verification_date ? ' Experience ✓' : ' Experience ✗'} | 
                            {worker.cv_analysis_date ? ' CV ✓' : ' CV ✗'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks and shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="w-4 h-4 mr-2" />
                    Assess Skills for All Workers
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Award className="w-4 h-4 mr-2" />
                    Verify Experience for Pending
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Analyze CVs for New Workers
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Generate Compliance Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skills-assessment">
            <FileUploadSection label="Skills Assessment" onAssessmentComplete={handleAssessmentComplete} />
          </TabsContent>

          <TabsContent value="experience-verification">
            <FileUploadSection label="Experience Verification" onAssessmentComplete={handleAssessmentComplete} />
          </TabsContent>

          <TabsContent value="cv-analysis">
            <FileUploadSection label="CV Analysis" onAssessmentComplete={handleAssessmentComplete} />
          </TabsContent>

          <TabsContent value="ai-assistant" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bot className="w-5 h-5" />
                      <span>AI Assistant</span>
                    </CardTitle>
                    <CardDescription>
                      Get instant guidance on skills and experience compliance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.type === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-200'
                              }`}
                            >
                              <div className="flex items-center space-x-2 mb-1">
                                {message.type === 'user' ? (
                                  <User className="w-4 h-4" />
                                ) : (
                                  <Bot className="w-4 h-4" />
                                )}
                                <span className="text-xs opacity-70">
                                  {message.timestamp.toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Ask about skills verification, experience validation, or compliance..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1"
                        />
                        <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5" />
                      <span>Quick Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        setNewMessage('How do I verify worker skills?');
                        handleSendMessage();
                      }}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Skills Verification
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        setNewMessage('What documents do I need for experience verification?');
                        handleSendMessage();
                      }}
                    >
                      <Award className="w-4 h-4 mr-2" />
                      Experience Validation
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        setNewMessage('How can I improve a worker\'s CV?');
                        handleSendMessage();
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      CV Improvement
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        setNewMessage('What are the compliance requirements for skills and experience?');
                        handleSendMessage();
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Compliance Guide
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Guidance</CardTitle>
                    <CardDescription>
                      Key areas to focus on
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {complianceGuidance.map((guidance) => (
                      <div key={guidance.id} className="p-3 border rounded-lg">
                        <div className="flex items-start space-x-3">
                          {getCategoryIcon(guidance.category)}
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">{guidance.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">{guidance.description}</p>
                            <Badge className={`mt-2 text-xs ${getPriorityColor(guidance.priority)}`}>
                              {guidance.priority} priority
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 