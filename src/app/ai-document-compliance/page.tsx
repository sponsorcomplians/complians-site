'use client'

import { Suspense } from 'react'
import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  FileText, 
  Users, 
  MessageSquare, 
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bot,
  FileCheck,
  Clock,
  Download,
  Eye,
  Send,
  Mail,
  Printer,
  Plus,
  HelpCircle,
  Shield,
  Calendar,
  Search
} from 'lucide-react'
import AgentAssessmentExplainer from "../../components/AgentAssessmentExplainer"

// Custom Card Components
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
)

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pb-2 ${className}`}>
    {children}
  </div>
)

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
)

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
)

// Custom Button Component
const Button = ({ 
  children, 
  className = '', 
  size = 'default',
  variant = 'default',
  onClick,
  disabled = false,
  ...props 
}: { 
  children: React.ReactNode; 
  className?: string; 
  size?: 'default' | 'sm';
  variant?: 'default' | 'destructive' | 'outline';
  onClick?: () => void;
  disabled?: boolean;
  [key: string]: any;
}) => {
  const sizeClasses = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'
  const variantClasses = variant === 'destructive' 
    ? 'bg-red-500 hover:bg-red-600 text-white' 
    : variant === 'outline'
    ? 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-900'
    : 'bg-gray-900 hover:bg-gray-800 text-white'
  
  return (
    <button 
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${sizeClasses} ${variantClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

// Custom Badge Component
const Badge = ({ 
  children, 
  variant = 'default',
  className = '' 
}: { 
  children: React.ReactNode; 
  variant?: 'default' | 'outline' | 'destructive';
  className?: string;
}) => {
  const variantClasses = variant === 'outline' 
    ? 'border border-current bg-transparent' 
    : variant === 'destructive'
    ? 'bg-red-500 text-white animate-pulse'
    : 'bg-gray-900 text-white'
  
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variantClasses} ${className}`}>
      {children}
    </div>
  )
}

// Custom Tabs Components
const Tabs = ({ 
  children, 
  value, 
  onValueChange, 
  className = '' 
}: { 
  children: React.ReactNode; 
  value: string; 
  onValueChange: (value: string) => void;
  className?: string;
}) => (
  <div className={className} data-value={value} data-onvaluechange={onValueChange}>
    {children}
  </div>
)

const TabsList = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}>
    {children}
  </div>
)

const TabsTrigger = ({ 
  children, 
  value, 
  className = '',
  activeTab,
  onValueChange
}: { 
  children: React.ReactNode; 
  value: string;
  className?: string;
  activeTab: string;
  onValueChange: (value: string) => void;
}) => {
  const isActive = activeTab === value
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive 
          ? 'bg-white text-gray-950 shadow-sm' 
          : 'text-gray-500 hover:text-gray-900'
      } ${className}`}
      onClick={() => onValueChange(value)}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ 
  children, 
  value, 
  activeTab 
}: { 
  children: React.ReactNode; 
  value: string;
  activeTab: string;
}) => {
  if (activeTab !== value) return null
  return (
    <div className="mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2">
      {children}
    </div>
  )
}

// Types for our data structures
interface Document {
  id: string
  name: string
  type: 'COS' | 'PASSPORT' | 'VISA' | 'QUALIFICATION' | 'PAYSLIP' | 'CONTRACT' | 'OTHER'
  status: 'VERIFIED' | 'PENDING' | 'EXPIRED' | 'MISSING' | 'INVALID'
  uploadedDate: string
  expiryDate?: string
  workerId?: string
  workerName?: string
  authenticityScore: number
  complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'REQUIRES_ATTENTION'
}

interface DocumentAssessment {
  id: string
  documentId: string
  documentName: string
  workerName: string
  assessmentType: 'AUTHENTICITY' | 'COMPLIANCE' | 'EXPIRY'
  status: 'PASSED' | 'FAILED' | 'REQUIRES_REVIEW'
  findings: string
  recommendations: string
  generatedAt: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// Content component that uses useSearchParams
function DocumentComplianceContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [currentAssessment, setCurrentAssessment] = useState<DocumentAssessment | null>(null)
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'COS Certificate - John Smith',
      type: 'COS',
      status: 'VERIFIED',
      uploadedDate: '2024-06-10',
      expiryDate: '2027-06-10',
      workerId: 'WORKER_001',
      workerName: 'John Smith',
      authenticityScore: 95,
      complianceStatus: 'COMPLIANT'
    },
    {
      id: '2',
      name: 'Passport - Sarah Johnson',
      type: 'PASSPORT',
      status: 'EXPIRED',
      uploadedDate: '2024-01-15',
      expiryDate: '2024-05-15',
      workerId: 'WORKER_002',
      workerName: 'Sarah Johnson',
      authenticityScore: 88,
      complianceStatus: 'REQUIRES_ATTENTION'
    },
    {
      id: '3',
      name: 'Care Certificate - Rotimi Michael',
      type: 'QUALIFICATION',
      status: 'PENDING',
      uploadedDate: '2024-06-08',
      workerId: 'WORKER_003',
      workerName: 'Rotimi Michael Owolabi-Akinloye',
      authenticityScore: 0,
      complianceStatus: 'NON_COMPLIANT'
    }
  ])
  
  const [assessments, setAssessments] = useState<DocumentAssessment[]>([])
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI document compliance assistant. I can help you with questions about document verification, authenticity checking, expiry monitoring, and compliance requirements. How can I assist you today?',
      timestamp: new Date().toISOString()
    }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Calculate dashboard stats dynamically
  const dashboardStats = {
    totalDocuments: documents.length,
    verifiedDocuments: documents.filter(d => d.status === 'VERIFIED').length,
    expiredDocuments: documents.filter(d => d.status === 'EXPIRED').length,
    pendingDocuments: documents.filter(d => d.status === 'PENDING').length,
    complianceRate: documents.length > 0 ? Math.round((documents.filter(d => d.complianceStatus === 'COMPLIANT').length / documents.length) * 100) : 0,
    averageAuthenticityScore: documents.length > 0 ? Math.round(documents.reduce((sum, d) => sum + d.authenticityScore, 0) / documents.length) : 0
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one document to upload.')
      return
    }

    setUploading(true)
    
    // Simulate AI processing
    setTimeout(() => {
      const newDocuments: Document[] = selectedFiles.map((file, index) => {
        const documentType = file.name.toLowerCase().includes('cos') ? 'COS' :
                           file.name.toLowerCase().includes('passport') ? 'PASSPORT' :
                           file.name.toLowerCase().includes('visa') ? 'VISA' :
                           file.name.toLowerCase().includes('certificate') ? 'QUALIFICATION' :
                           file.name.toLowerCase().includes('payslip') ? 'PAYSLIP' :
                           file.name.toLowerCase().includes('contract') ? 'CONTRACT' : 'OTHER'
        
        const authenticityScore = Math.floor(Math.random() * 40) + 60 // 60-100
        const status = authenticityScore > 90 ? 'VERIFIED' : 
                      authenticityScore > 70 ? 'PENDING' : 'INVALID'
        const complianceStatus = status === 'VERIFIED' ? 'COMPLIANT' : 
                                status === 'PENDING' ? 'REQUIRES_ATTENTION' : 'NON_COMPLIANT'
        
        return {
          id: 'DOC_' + Date.now() + index,
          name: file.name,
          type: documentType,
          status,
          uploadedDate: new Date().toISOString().split('T')[0],
          expiryDate: documentType === 'PASSPORT' || documentType === 'VISA' ? 
                     new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
          workerId: 'WORKER_' + Math.floor(Math.random() * 1000),
          workerName: 'Worker from ' + file.name.split('.')[0],
          authenticityScore,
          complianceStatus
        }
      })

      setDocuments(prev => [...prev, ...newDocuments])
      setUploading(false)
      setSelectedFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }, 3000)
  }

  const handleChatSend = async () => {
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date().toISOString()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setChatLoading(true)

    // Simulate AI response
    setTimeout(() => {
      let response = ''
      const query = chatInput.toLowerCase()

      if (query.includes('authenticity') || query.includes('verification')) {
        response = `Document authenticity verification process:

Key Checks:
• Digital signature validation
• Metadata analysis
• Format consistency
• Content integrity
• Source verification

Authenticity Score Ranges:
• 90-100: Highly authentic
• 70-89: Requires review
• Below 70: Suspect authenticity

Best Practices:
- Upload original documents
- Ensure clear, readable scans
- Verify document sources
- Check for tampering signs
- Maintain audit trail`
      } else if (query.includes('expiry') || query.includes('expired')) {
        response = `Document expiry monitoring:

Critical Documents:
• Passports (check expiry dates)
• Visas (monitor validity periods)
• Professional qualifications
• Right to work documents
• Insurance certificates

Monitoring Requirements:
- Set up expiry alerts (30 days prior)
- Track renewal deadlines
- Maintain updated records
- Plan renewal processes
- Document expiry status

Compliance Actions:
• Renew documents before expiry
• Update records immediately
• Notify relevant authorities
• Maintain compliance evidence`
      } else if (query.includes('compliance') || query.includes('requirements')) {
        response = `Document compliance requirements for UK sponsors:

Essential Documents:
• Certificate of Sponsorship (CoS)
• Passport and visa documents
• Right to work evidence
• Qualification certificates
• Employment contracts
• Payslips and salary evidence

Compliance Standards:
- Documents must be current and valid
- Authenticity verification required
- Proper storage and accessibility
- Regular review and updates
- Audit trail maintenance

Risk Mitigation:
• Regular document audits
• Automated expiry monitoring
• Authenticity verification
• Compliance reporting
• Staff training on requirements`
      } else {
        response = `I can help with document compliance questions about:

• Document authenticity verification
• Expiry date monitoring and alerts
• Compliance requirements for UK sponsors
• Document storage and management
• Audit preparation and evidence
• Risk assessment and mitigation

Please ask a specific question about document compliance.`
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      }

      setChatMessages(prev => [...prev, assistantMessage])
      setChatLoading(false)
    }, 1500)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge className="bg-green-500 text-white">Verified</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>
      case 'EXPIRED':
        return <Badge variant="destructive">Expired</Badge>
      case 'MISSING':
        return <Badge className="bg-red-500 text-white">Missing</Badge>
      case 'INVALID':
        return <Badge variant="destructive">Invalid</Badge>
      default:
        return <Badge className="bg-gray-500 text-white">Unknown</Badge>
    }
  }

  const getComplianceBadge = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return <Badge className="bg-green-500 text-white">Compliant</Badge>
      case 'REQUIRES_ATTENTION':
        return <Badge className="bg-yellow-500 text-white">Requires Attention</Badge>
      case 'NON_COMPLIANT':
        return <Badge variant="destructive">Non-Compliant</Badge>
      default:
        return <Badge className="bg-gray-500 text-white">Unknown</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#263976] mb-2 flex items-center gap-3">
          <FileText className="h-8 w-8 text-[#00c3ff]" />
          AI Document Compliance System
        </h1>
        <p className="text-gray-600">
          AI-powered document verification and compliance checking for UK sponsors
        </p>
      </div>

      {/* Explainer Module */}
      <div className="mb-8">
        <AgentAssessmentExplainer />
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger 
            value="dashboard" 
            className="flex items-center gap-2"
            activeTab={activeTab}
            onValueChange={setActiveTab}
          >
            <FileText className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger 
            value="documents" 
            className="flex items-center gap-2"
            activeTab={activeTab}
            onValueChange={setActiveTab}
          >
            <Users className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger 
            value="verification" 
            className="flex items-center gap-2"
            activeTab={activeTab}
            onValueChange={setActiveTab}
          >
            <Search className="h-4 w-4" />
            Verification
          </TabsTrigger>
          <TabsTrigger 
            value="ai-assistant" 
            className="flex items-center gap-2"
            activeTab={activeTab}
            onValueChange={setActiveTab}
          >
            <MessageSquare className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" activeTab={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                <FileText className="h-4 w-4 text-[#00c3ff]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#263976]">{dashboardStats.totalDocuments}</div>
                <p className="text-xs text-gray-600">Uploaded documents</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#263976]">{dashboardStats.complianceRate}%</div>
                <p className="text-xs text-gray-600">{documents.filter(d => d.complianceStatus === 'COMPLIANT').length} compliant</p>
              </CardContent>
            </Card>
            
            <Card className={dashboardStats.expiredDocuments > 0 ? 'border-red-500 border-2 animate-pulse' : ''}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">🚨 Expired Documents</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{dashboardStats.expiredDocuments}</div>
                <p className="text-xs text-red-600">Immediate attention required</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Authenticity Score</CardTitle>
                <Shield className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#263976]">{dashboardStats.averageAuthenticityScore}%</div>
                <p className="text-xs text-gray-600">Average score</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#263976]">Recent Document Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {documents.slice(-3).reverse().map((document, index) => (
                <div key={document.id} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${document.status === 'EXPIRED' ? 'bg-red-500 animate-pulse' : document.status === 'VERIFIED' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {document.status === 'EXPIRED' ? `Expired document: ${document.name}` : 
                       document.status === 'VERIFIED' ? `Document verified: ${document.name}` :
                       `Document pending: ${document.name}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {document.workerName} • {document.uploadedDate} • Authenticity: {document.authenticityScore}%
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" activeTab={activeTab}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-[#263976] flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </CardTitle>
                <p className="text-gray-600 text-sm mt-1">Manage and monitor all compliance documents</p>
              </div>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-900 text-white">
                      <th className="text-left p-4 font-medium">Document Name</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Worker</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Compliance</th>
                      <th className="text-left p-4 font-medium">Authenticity</th>
                      <th className="text-left p-4 font-medium">Uploaded</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((document) => (
                      <tr key={document.id} className="border-b">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{document.name}</p>
                            {document.expiryDate && (
                              <p className="text-xs text-gray-500">
                                Expires: {document.expiryDate}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className="bg-blue-500 text-white">{document.type}</Badge>
                        </td>
                        <td className="p-4">{document.workerName || 'N/A'}</td>
                        <td className="p-4">{getStatusBadge(document.status)}</td>
                        <td className="p-4">{getComplianceBadge(document.complianceStatus)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${document.authenticityScore >= 90 ? 'bg-green-500' : document.authenticityScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${document.authenticityScore}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{document.authenticityScore}%</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm">{document.uploadedDate}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification" activeTab={activeTab}>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#263976] flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Document Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Upload Documents for Verification</h3>
                  <p className="text-gray-600 mb-4">
                    Upload documents for AI-powered authenticity verification and compliance checking
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <Button 
                    className="bg-[#00c3ff] hover:bg-[#0099cc] text-white mb-4"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose Files
                  </Button>
                  
                  {selectedFiles.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Selected Files:</h4>
                      <ul className="text-sm text-gray-600">
                        {selectedFiles.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                      <Button 
                        className="bg-[#263976] hover:bg-[#1e2a5a] text-white mt-4"
                        onClick={handleUpload}
                        disabled={uploading}
                      >
                        {uploading ? 'Verifying...' : 'Start Verification'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai-assistant" activeTab={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle className="text-[#263976] flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Document Compliance Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-96 border rounded-lg p-4 bg-gray-50 overflow-y-auto">
                  <div className="space-y-3">
                    {chatMessages.map((message, index) => (
                      <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.role === 'user' 
                            ? 'bg-[#263976] text-white' 
                            : 'bg-white shadow-sm border'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#263976]"></div>
                            <span className="text-sm">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ask about document verification, authenticity, expiry monitoring..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c3ff]"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                    disabled={chatLoading}
                  />
                  <Button 
                    className="bg-[#263976] hover:bg-[#1e2a5a] text-white"
                    onClick={handleChatSend}
                    disabled={chatLoading || !chatInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Default export with Suspense wrapper
export default function AIDocumentCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DocumentComplianceContent />
    </Suspense>
  );
} 