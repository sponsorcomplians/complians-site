'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  BarChart3, 
  Users, 
  FileText, 
  MessageSquare, 
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bot,
  FileCheck,
  Clock,
  TrendingUp,
  Download,
  Eye,
  Send,
  Mail,
  Printer,
  Plus,
  PieChart,
  HelpCircle
} from 'lucide-react'

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

// Simple Chart Components
const PieChartComponent = ({ data }: { data: any[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let cumulativePercentage = 0

  return (
    <div className="flex items-center justify-center">
      <svg width="200" height="200" viewBox="0 0 200 200">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100
          const startAngle = (cumulativePercentage / 100) * 360
          const endAngle = ((cumulativePercentage + percentage) / 100) * 360
          
          const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180)
          const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180)
          const x2 = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180)
          const y2 = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180)
          
          const largeArcFlag = percentage > 50 ? 1 : 0
          
          const pathData = [
            `M 100 100`,
            `L ${x1} ${y1}`,
            `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ')
          
          cumulativePercentage += percentage
          
          return (
            <path
              key={index}
              d={pathData}
              fill={item.color}
              stroke="white"
              strokeWidth="2"
            />
          )
        })}
      </svg>
    </div>
  )
}

const BarChartComponent = ({ data }: { data: any[] }) => {
  const maxValue = Math.max(...data.map(item => item.value))
  
  return (
    <div className="flex items-end justify-center space-x-2 h-40">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center">
          <div 
            className="w-12 bg-blue-500 rounded-t"
            style={{ height: `${(item.value / maxValue) * 120}px` }}
          ></div>
          <span className="text-xs mt-2 text-center">{item.name}</span>
          <span className="text-xs text-gray-500">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

// Types for our data structures
interface Worker {
  id: string
  name: string
  jobTitle: string
  socCode: string
  cosReference: string
  complianceStatus: 'COMPLIANT' | 'BREACH' | 'SERIOUS_BREACH'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  lastAssessment: string
  redFlag: boolean
  assignmentDate: string
}

interface Assessment {
  id: string
  workerId: string
  workerName: string
  cosReference: string
  jobTitle: string
  socCode: string
  complianceStatus: 'COMPLIANT' | 'BREACH' | 'SERIOUS_BREACH'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  evidenceStatus: string
  breachType?: string
  redFlag: boolean
  assignmentDate: string
  professionalAssessment: string
  generatedAt: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function AIComplianceDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null)
  const [selectedWorkerAssessment, setSelectedWorkerAssessment] = useState<Assessment | null>(null)
  const [workers, setWorkers] = useState<Worker[]>([
    {
      id: '1',
      name: 'John Smith',
      jobTitle: 'Software Developer',
      socCode: '2136',
      cosReference: 'COS123456',
      complianceStatus: 'COMPLIANT',
      riskLevel: 'LOW',
      lastAssessment: '2024-06-10',
      redFlag: false,
      assignmentDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      jobTitle: 'Care Assistant',
      socCode: '6145',
      cosReference: 'COS789012',
      complianceStatus: 'SERIOUS_BREACH',
      riskLevel: 'HIGH',
      lastAssessment: '2024-06-09',
      redFlag: true,
      assignmentDate: '2024-02-20'
    },
    {
      id: '3',
      name: 'Ahmed Hassan',
      jobTitle: 'Senior Care Worker',
      socCode: '6146',
      cosReference: 'COS345678',
      complianceStatus: 'BREACH',
      riskLevel: 'MEDIUM',
      lastAssessment: '2024-06-08',
      redFlag: false,
      assignmentDate: '2024-03-10'
    }
  ])
  
  const [assessments, setAssessments] = useState<Assessment[]>([])
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI compliance assistant. I can help you with questions about qualification requirements, SOC codes, Care Certificates, and compliance obligations. How can I assist you today?',
      timestamp: new Date().toISOString()
    }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Calculate dashboard stats dynamically
  const dashboardStats = {
    totalWorkers: workers.length,
    compliantWorkers: workers.filter(w => w.complianceStatus === 'COMPLIANT').length,
    redFlags: workers.filter(w => w.redFlag).length,
    highRisk: workers.filter(w => w.riskLevel === 'HIGH').length,
    complianceRate: workers.length > 0 ? Math.round((workers.filter(w => w.complianceStatus === 'COMPLIANT').length / workers.length) * 100) : 0
  }

  // Chart data - recalculated when workers change
  const pieChartData = [
    { name: 'Compliant', value: workers.filter(w => w.complianceStatus === 'COMPLIANT').length, color: '#10B981' },
    { name: 'Breach', value: workers.filter(w => w.complianceStatus === 'BREACH').length, color: '#F59E0B' },
    { name: 'Serious Breach', value: workers.filter(w => w.complianceStatus === 'SERIOUS_BREACH').length, color: '#EF4444' }
  ]

  const barChartData = [
    { name: 'Low Risk', value: workers.filter(w => w.riskLevel === 'LOW').length },
    { name: 'Medium Risk', value: workers.filter(w => w.riskLevel === 'MEDIUM').length },
    { name: 'High Risk', value: workers.filter(w => w.riskLevel === 'HIGH').length }
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
  }

  // Enhanced document processing to extract worker name
  const extractWorkerInfo = (files: File[]) => {
    // Simulate document processing to extract worker information
    const cosFile = files.find(f => f.name.toLowerCase().includes('cos') || f.name.toLowerCase().includes('certificate'))
    const cvFile = files.find(f => f.name.toLowerCase().includes('cv') || f.name.toLowerCase().includes('resume'))
    
    // Mock extraction - in real implementation, this would use OCR/PDF parsing
    let workerName = 'Unknown Worker'
    let cosReference = 'UNKNOWN'
    
    if (cosFile) {
      // Extract from filename or simulate OCR
      if (cosFile.name.includes('Alen')) {
        workerName = 'Alen Thomas'
        cosReference = 'C2G8Y18250Q'
      } else if (cosFile.name.includes('John')) {
        workerName = 'John Doe'
        cosReference = 'COS987654'
      } else {
        // Generate realistic name from filename
        const nameMatch = cosFile.name.match(/([A-Z][a-z]+\s[A-Z][a-z]+)/)
        if (nameMatch) {
          workerName = nameMatch[1]
        } else {
          workerName = 'Worker from ' + cosFile.name.split('.')[0]
        }
        cosReference = 'COS' + Math.random().toString().substr(2, 6)
      }
    }
    
    return { workerName, cosReference }
  }

  const generateProfessionalAssessment = (workerName: string, cosRef: string, jobTitle: string, socCode: string, assignmentDate: string) => {
    return `You assigned Certificate of Sponsorship (CoS) for ${workerName} (${cosRef}) on ${assignmentDate} to work as a ${jobTitle} under Standard Occupational Classification (SOC) code ${socCode} Care workers and home carers.

${workerName}'s file includes a copy of his CV, which confirms that he holds a Bachelor of Engineering in Mechanical Engineering, obtained in 2013, with over seven years of professional experience in HVAC systems, including project and operations management roles in India and South Sudan. This academic and professional background is further supported by the application form he submitted.

However, there is no evidence that he holds any qualifications relevant to health or social care. Specifically, the file does not include proof of completing a Care Certificate, NVQ Level 2 or 3 in Health and Social Care, or any other UK-recognised care qualification. Additionally, there is no indication of training in key care-related courses, such as First Aid, Manual Handling, or Safeguarding, which are typically expected for care roles involving vulnerable individuals.

The summary of job description in his CoS states: Give support and care to residents whilst maintaining their rights to independence, privacy, dignity and choice and assist in their daily living. Assist residents who require help to dress/undress, wash, and bath and use the toilet. Assist residents with mobility problems and other physical disabilities including the use and care of aids and personal equipment. Assist residents who need help with personal hygiene e.g. incontinence. Assist in the care of residents who are unwell or dying. Monitor the needs of the residents, informing a senior member of staff on duty of any emergency situation or concern about their well-being.

Such tasks require not only practical experience but also mandatory training and care qualifications to ensure safe and lawful practice. These duties are not transferable from an engineering background and must only be performed by someone who holds appropriate care-related credentials.

Although an HR meeting document notes that ${workerName} completed a Level 2 Health and Safety course, this is not referenced anywhere in his CV or in his original application form. Moreover, a general health and safety certificate is not a substitute for sector-specific training in adult social care, and does not meet the qualification requirements for the role of ${jobTitle} as defined under SOC code ${socCode}.

In summary, ${workerName}'s qualifications and work experience are not aligned with the requirements of the care role for which he was sponsored. The absence of recognised care qualifications or training indicates that he does not meet the eligibility criteria under Sponsor Guidance Rule C1.38, which requires that all sponsored workers be appropriately qualified, registered, or experienced for the job they are assigned.`
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one document to upload.')
      return
    }

    setUploading(true)
    
    // Extract worker information from documents
    const { workerName, cosReference } = extractWorkerInfo(selectedFiles)
    
    // Simulate AI processing
    setTimeout(() => {
      const jobTitle = 'Care Assistant'
      const socCode = '6145'
      const assignmentDate = new Date().toLocaleDateString('en-GB')
      
      // Generate professional assessment
      const professionalAssessment = generateProfessionalAssessment(workerName, cosReference, jobTitle, socCode, assignmentDate)
      
      // Mock assessment result
      const mockAssessment: Assessment = {
        id: 'ASSESS_' + Date.now(),
        workerId: 'WORKER_' + Date.now(),
        workerName,
        cosReference,
        jobTitle,
        socCode,
        complianceStatus: 'SERIOUS_BREACH',
        riskLevel: 'HIGH',
        evidenceStatus: 'MISSING_CRITICAL',
        breachType: 'NO_CARE_QUALIFICATIONS',
        redFlag: true,
        assignmentDate,
        professionalAssessment,
        generatedAt: new Date().toISOString()
      }

      // Add worker to the workers list
      const newWorker: Worker = {
        id: mockAssessment.workerId,
        name: workerName,
        jobTitle,
        socCode,
        cosReference,
        complianceStatus: 'SERIOUS_BREACH',
        riskLevel: 'HIGH',
        lastAssessment: new Date().toISOString().split('T')[0],
        redFlag: true,
        assignmentDate
      }

      // Update state
      setWorkers(prev => [...prev, newWorker])
      setAssessments(prev => [...prev, mockAssessment])
      setCurrentAssessment(mockAssessment)
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

      if (query.includes('care certificate')) {
        response = `The Care Certificate is a fundamental qualification for care workers in the UK. It covers 15 standards including:

• Communication
• Personal development  
• Equality and diversity
• Working in a person-centred way
• Safeguarding adults and children
• Health and safety
• Infection prevention and control

For SOC codes 6145 and 6146 (care roles), workers must have either:
- Care Certificate, OR
- NVQ/SVQ Level 2 or 3 in Health and Social Care, OR  
- Equivalent healthcare qualification

Workers without appropriate qualifications cannot legally perform care duties.`
      } else if (query.includes('soc') || query.includes('6145') || query.includes('6146')) {
        response = `SOC codes 6145 and 6146 are care-related roles that require specific healthcare qualifications:

• SOC 6145: Care workers and home carers
• SOC 6146: Senior care workers

These roles require workers to have appropriate healthcare qualifications such as:
- Care Certificate
- NVQ/SVQ Level 2+ in Health and Social Care
- BTEC in Health and Social Care
- Equivalent healthcare qualification

Assigning workers to these roles without proper qualifications is a serious breach of sponsor duties.`
      } else if (query.includes('red flag') || query.includes('serious breach')) {
        response = `Red flags indicate serious compliance breaches requiring immediate attention:

🚨 RED FLAG CONDITIONS:
• Worker assigned to care role without healthcare qualifications
• Engineering/technical background worker in care position
• Missing Care Certificate or equivalent for SOC 6145/6146
• No evidence of essential training (First Aid, Safeguarding)

IMMEDIATE ACTIONS REQUIRED:
1. Suspend worker from care duties
2. Enroll in appropriate qualification program
3. Review recruitment processes
4. Consider Home Office reporting obligations
5. Document remedial actions taken`
      } else {
        response = `I can help with compliance questions about:

• Care Certificate requirements
• SOC codes 6145 and 6146
• Healthcare qualifications
• Red flag conditions
• Essential training requirements
• Sponsor duty obligations

Please ask a specific question about qualification compliance.`
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

  const getStatusBadge = (status: string, redFlag: boolean = false) => {
    if (redFlag || status === 'SERIOUS_BREACH') {
      return (
        <Badge variant="destructive" className="bg-red-500 text-white animate-pulse">
          SERIOUS BREACH
        </Badge>
      )
    }
    
    switch (status) {
      case 'COMPLIANT':
        return <Badge className="bg-green-500 text-white">COMPLIANT</Badge>
      case 'BREACH':
        return <Badge variant="destructive">BREACH</Badge>
      default:
        return <Badge variant="outline">NOT APPLICABLE</Badge>
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return <Badge className="bg-green-100 text-green-800">LOW</Badge>
      case 'MEDIUM':
        return <Badge className="bg-yellow-100 text-yellow-800">MEDIUM</Badge>
      case 'HIGH':
        return <Badge className="bg-red-100 text-red-800">HIGH</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Enhanced report functions
  const handleDownloadPDF = () => {
    if (!currentAssessment && !selectedWorkerAssessment) {
      alert('No assessment report available to download.')
      return
    }
    
    const assessment = currentAssessment || selectedWorkerAssessment
    
    // Create a simple HTML content for PDF
    const reportContent = `
      <html>
        <head>
          <title>Compliance Assessment Report - ${assessment?.workerName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .alert { background-color: #ef4444; color: white; padding: 15px; text-align: center; margin: 20px 0; }
            .content { line-height: 1.6; margin: 20px 0; }
            .summary { background-color: #f9f9f9; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Compliance Analysis Report</h1>
            <p>Generated on ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}</p>
          </div>
          ${assessment?.redFlag ? '<div class="alert">🚨 SERIOUS BREACH DETECTED 🚨<br>Qualification requirements not met - Immediate review required</div>' : ''}
          <div class="content">
            ${assessment?.professionalAssessment.replace(/\n/g, '<br><br>')}
          </div>
          <div class="summary">
            <h3>Assessment Summary</h3>
            <p><strong>Worker:</strong> ${assessment?.workerName}</p>
            <p><strong>CoS Reference:</strong> ${assessment?.cosReference}</p>
            <p><strong>Job Title:</strong> ${assessment?.jobTitle}</p>
            <p><strong>SOC Code:</strong> ${assessment?.socCode}</p>
            <p><strong>Assignment Date:</strong> ${assessment?.assignmentDate}</p>
            <p><strong>Status:</strong> ${assessment?.complianceStatus}</p>
          </div>
        </body>
      </html>
    `
    
    // Create blob and download
    const blob = new Blob([reportContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Compliance_Report_${assessment?.workerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    alert('Report downloaded successfully!')
  }

  const handleEmailReport = () => {
    if (!currentAssessment && !selectedWorkerAssessment) {
      alert('No assessment report available to email.')
      return
    }
    
    const assessment = currentAssessment || selectedWorkerAssessment
    const subject = `Compliance Assessment Report - ${assessment?.workerName}`
    const body = `Please find the compliance assessment report for ${assessment?.workerName} (${assessment?.cosReference}).

Status: ${assessment?.complianceStatus}
Risk Level: ${assessment?.riskLevel}
Generated: ${new Date().toLocaleDateString('en-GB')}

${assessment?.professionalAssessment}

---
This report was generated by the AI Qualification Compliance System.`
    
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink)
  }

  const handlePrintReport = () => {
    if (!currentAssessment && !selectedWorkerAssessment) {
      alert('No assessment report available to print.')
      return
    }
    
    window.print()
  }

  // View specific worker report
  const handleViewWorkerReport = (workerId: string) => {
    const workerAssessment = assessments.find(a => a.workerId === workerId)
    if (workerAssessment) {
      setSelectedWorkerAssessment(workerAssessment)
      setActiveTab('assessment')
    } else {
      alert('No assessment report found for this worker. Please run an assessment first.')
    }
  }

  // Help with breach - contact support
  const handleHelpWithBreach = (workerName: string) => {
    const subject = `Help Required - Compliance Breach for ${workerName}`
    const body = `Dear Complians Support Team,

I need assistance with a compliance breach for worker: ${workerName}

Please provide guidance on:
- Immediate actions required
- Remedial steps to take
- Documentation needed
- Home Office reporting obligations

Thank you for your assistance.

Best regards`
    
    const mailtoLink = `mailto:support@complians.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink)
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#263976] mb-2 flex items-center gap-3">
          <Bot className="h-8 w-8 text-[#00c3ff]" />
          AI Qualification Compliance System
        </h1>
        <p className="text-gray-600">
          AI-powered qualification compliance analysis for UK sponsors with red flag detection
        </p>
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
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger 
            value="workers" 
            className="flex items-center gap-2"
            activeTab={activeTab}
            onValueChange={setActiveTab}
          >
            <Users className="h-4 w-4" />
            Workers
          </TabsTrigger>
          <TabsTrigger 
            value="assessment" 
            className="flex items-center gap-2"
            activeTab={activeTab}
            onValueChange={setActiveTab}
          >
            <FileText className="h-4 w-4" />
            Assessment
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
                <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
                <Users className="h-4 w-4 text-[#00c3ff]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#263976]">{dashboardStats.totalWorkers}</div>
                <p className="text-xs text-gray-600">Active workers</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#263976]">{dashboardStats.complianceRate}%</div>
                <p className="text-xs text-gray-600">{dashboardStats.compliantWorkers} compliant workers</p>
              </CardContent>
            </Card>
            
            <Card className={dashboardStats.redFlags > 0 ? 'border-red-500 border-2 animate-pulse' : ''}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">🚨 Red Flags</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{dashboardStats.redFlags}</div>
                <p className="text-xs text-red-600">Immediate attention required</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#263976]">{dashboardStats.highRisk}</div>
                <p className="text-xs text-gray-600">High risk workers</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#263976] flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Compliance Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PieChartComponent data={pieChartData} />
                <div className="flex justify-center space-x-4 mt-4">
                  {pieChartData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[#263976] flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Risk Level Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChartComponent data={barChartData} />
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#263976]">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {workers.slice(-3).reverse().map((worker, index) => (
                <div key={worker.id} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${worker.redFlag ? 'bg-red-500 animate-pulse' : worker.complianceStatus === 'COMPLIANT' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {worker.redFlag ? `Red flag detected for ${worker.name}` : 
                       worker.complianceStatus === 'COMPLIANT' ? `${worker.name} assessment completed` :
                       `${worker.name} requires review`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {worker.redFlag ? `${worker.jobTitle} without qualifications` : 
                       worker.complianceStatus === 'COMPLIANT' ? 'Compliant status confirmed' :
                       'Missing training certificates'} - {worker.lastAssessment}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workers Tab */}
        <TabsContent value="workers" activeTab={activeTab}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-[#263976] flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Workers
                </CardTitle>
                <p className="text-gray-600 text-sm mt-1">Manage sponsored workers and their qualifications</p>
              </div>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Worker
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-900 text-white">
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">CoS Reference</th>
                      <th className="text-left p-4 font-medium">Job Title</th>
                      <th className="text-left p-4 font-medium">SOC Code</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Risk Level</th>
                      <th className="text-left p-4 font-medium">View Compliance Report</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.map((worker) => (
                      <tr key={worker.id} className={`border-b ${worker.redFlag ? 'bg-red-50' : ''}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {worker.name}
                            {worker.redFlag && (
                              <span className="text-red-500 text-xs animate-pulse">🚨</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">{worker.cosReference}</td>
                        <td className="p-4">{worker.jobTitle}</td>
                        <td className="p-4">{worker.socCode}</td>
                        <td className="p-4">{getStatusBadge(worker.complianceStatus, worker.redFlag)}</td>
                        <td className="p-4">{getRiskBadge(worker.riskLevel)}</td>
                        <td className="p-4">
                          <Button 
                            size="sm" 
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                            onClick={() => handleViewWorkerReport(worker.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Report
                          </Button>
                        </td>
                        <td className="p-4">
                          <Button 
                            size="sm" 
                            className="bg-green-500 hover:bg-green-600 text-white"
                            onClick={() => handleHelpWithBreach(worker.name)}
                          >
                            <HelpCircle className="h-4 w-4 mr-1" />
                            Help with Breach
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessment Tab */}
        <TabsContent value="assessment" activeTab={activeTab}>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#263976] flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Document Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Upload Compliance Documents</h3>
                  <p className="text-gray-600 mb-4">
                    Upload CoS certificate, CV, qualification documents, and application forms for AI analysis
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc"
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
                      <ul className="text-sm text-gray-600 space-y-1">
                        {selectedFiles.map((file, index) => (
                          <li key={index} className="flex items-center justify-center gap-2">
                            <FileText className="h-4 w-4" />
                            {file.name}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="bg-green-500 hover:bg-green-600 text-white mt-4"
                        onClick={handleUpload}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            AI Processing...
                          </>
                        ) : (
                          <>
                            <Bot className="h-4 w-4 mr-2" />
                            Analyze Documents
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Assessment Results */}
            {(currentAssessment || selectedWorkerAssessment) && (
              <Card className={(currentAssessment?.redFlag || selectedWorkerAssessment?.redFlag) ? 'border-red-500 border-2' : ''}>
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <FileText className="h-6 w-6 text-gray-600 mr-2" />
                    <CardTitle className="text-[#263976]">Compliance Analysis Report</CardTitle>
                  </div>
                  <p className="text-sm text-gray-600">
                    Generated on {new Date((currentAssessment || selectedWorkerAssessment)?.generatedAt || '').toLocaleDateString('en-GB')} {new Date((currentAssessment || selectedWorkerAssessment)?.generatedAt || '').toLocaleTimeString('en-GB', { hour12: false })}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Serious Breach Alert */}
                  {(currentAssessment?.redFlag || selectedWorkerAssessment?.redFlag) && (
                    <div className="bg-red-500 text-white p-4 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-bold">SERIOUS BREACH DETECTED</span>
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <p>Qualification requirements not met - Immediate review required</p>
                    </div>
                  )}

                  {/* Professional Assessment */}
                  <div className="border-l-4 border-blue-300 bg-blue-50 p-6">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                      {(currentAssessment || selectedWorkerAssessment)?.professionalAssessment}
                    </div>
                  </div>

                  {/* Assessment Summary */}
                  <div>
                    <h4 className="font-medium mb-3 text-[#263976] flex items-center gap-2">
                      <FileCheck className="h-4 w-4" />
                      Assessment Summary
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <label className="text-gray-600 font-medium">Worker:</label>
                        <p>{(currentAssessment || selectedWorkerAssessment)?.workerName}</p>
                      </div>
                      <div>
                        <label className="text-gray-600 font-medium">CoS Reference:</label>
                        <p>{(currentAssessment || selectedWorkerAssessment)?.cosReference}</p>
                      </div>
                      <div>
                        <label className="text-gray-600 font-medium">Job Title:</label>
                        <p>{(currentAssessment || selectedWorkerAssessment)?.jobTitle}</p>
                      </div>
                      <div>
                        <label className="text-gray-600 font-medium">SOC Code:</label>
                        <p>{(currentAssessment || selectedWorkerAssessment)?.socCode}</p>
                      </div>
                      <div>
                        <label className="text-gray-600 font-medium">Assignment Date:</label>
                        <p>{(currentAssessment || selectedWorkerAssessment)?.assignmentDate}</p>
                      </div>
                      <div>
                        <label className="text-gray-600 font-medium">Status:</label>
                        <div className="mt-1">{getStatusBadge((currentAssessment || selectedWorkerAssessment)?.complianceStatus || '', (currentAssessment || selectedWorkerAssessment)?.redFlag)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Report Options */}
                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4 text-[#263976] flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Report Options
                    </h4>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Button 
                        className="bg-red-500 hover:bg-red-600 text-white"
                        onClick={handleDownloadPDF}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button 
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={handleEmailReport}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email Report
                      </Button>
                      <Button 
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={handlePrintReport}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai-assistant" activeTab={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle className="text-[#263976] flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Compliance Assistant
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
                    placeholder="Ask about compliance requirements, SOC codes, Care Certificates..."
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

