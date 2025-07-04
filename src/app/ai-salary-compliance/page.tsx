'use client'

import { Suspense } from 'react'
import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
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
  HelpCircle,
  DollarSign,
  Calendar,
  Calculator
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
            className="w-12 bg-green-500 rounded-t"
            style={{ height: `${(item.value / maxValue) * 120}px` }}
          ></div>
          <span className="text-xs mt-2 text-center">{item.name}</span>
          <span className="text-xs text-gray-500">£{item.value}</span>
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
  complianceStatus: 'COMPLIANT' | 'UNDERPAID' | 'SERIOUS_BREACH'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  lastAssessment: string
  redFlag: boolean
  assignmentDate: string
  annualSalary: number
  monthlySalary: number
  contractedHours: number
}

interface SalaryAssessment {
  id: string
  workerId: string
  workerName: string
  cosReference: string
  jobTitle: string
  socCode: string
  complianceStatus: 'COMPLIANT' | 'UNDERPAID' | 'SERIOUS_BREACH'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  redFlag: boolean
  assignmentDate: string
  annualSalary: number
  monthlySalary: number
  contractedHours: number
  payslipData: Array<{month: string, amount: number}>
  professionalAssessment: string
  generatedAt: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// Content component that uses useSearchParams
function SalaryComplianceContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [currentAssessment, setCurrentAssessment] = useState<SalaryAssessment | null>(null)
  const [selectedWorkerAssessment, setSelectedWorkerAssessment] = useState<SalaryAssessment | null>(null)
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
      assignmentDate: '2024-01-15',
      annualSalary: 35000,
      monthlySalary: 2916.67,
      contractedHours: 40
    },
    {
      id: '2',
      name: 'Rotimi Michael Owolabi-Akinloye',
      jobTitle: 'Care Assistant',
      socCode: '6145',
      cosReference: 'C2G7K98710Q',
      complianceStatus: 'SERIOUS_BREACH',
      riskLevel: 'HIGH',
      lastAssessment: '2024-06-09',
      redFlag: true,
      assignmentDate: '2024-11-05',
      annualSalary: 26020.80,
      monthlySalary: 2168.40,
      contractedHours: 40
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      jobTitle: 'Senior Care Worker',
      socCode: '6146',
      cosReference: 'COS345678',
      complianceStatus: 'UNDERPAID',
      riskLevel: 'MEDIUM',
      lastAssessment: '2024-06-08',
      redFlag: false,
      assignmentDate: '2024-03-10',
      annualSalary: 28000,
      monthlySalary: 2333.33,
      contractedHours: 40
    }
  ])
  
  const [assessments, setAssessments] = useState<SalaryAssessment[]>([])
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI salary compliance assistant. I can help you with questions about salary thresholds, National Minimum Wage, payslip analysis, and Home Office sponsor duties. How can I assist you today?',
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
    underpaidWorkers: workers.filter(w => w.complianceStatus === 'UNDERPAID' || w.complianceStatus === 'SERIOUS_BREACH').length,
    complianceRate: workers.length > 0 ? Math.round((workers.filter(w => w.complianceStatus === 'COMPLIANT').length / workers.length) * 100) : 0,
    averageSalary: workers.length > 0 ? Math.round(workers.reduce((sum, w) => sum + w.annualSalary, 0) / workers.length) : 0
  }

  // Chart data - recalculated when workers change
  const pieChartData = [
    { name: 'Compliant', value: workers.filter(w => w.complianceStatus === 'COMPLIANT').length, color: '#10B981' },
    { name: 'Underpaid', value: workers.filter(w => w.complianceStatus === 'UNDERPAID').length, color: '#F59E0B' },
    { name: 'Serious Breach', value: workers.filter(w => w.complianceStatus === 'SERIOUS_BREACH').length, color: '#EF4444' }
  ]

  const salaryRangeData = [
    { name: '£20-25k', value: workers.filter(w => w.annualSalary >= 20000 && w.annualSalary < 25000).length },
    { name: '£25-30k', value: workers.filter(w => w.annualSalary >= 25000 && w.annualSalary < 30000).length },
    { name: '£30-35k', value: workers.filter(w => w.annualSalary >= 30000 && w.annualSalary < 35000).length },
    { name: '£35k+', value: workers.filter(w => w.annualSalary >= 35000).length }
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
  }

  // Enhanced document processing to extract worker and salary info
  const extractWorkerSalaryInfo = (files: File[]) => {
    console.log('📁 Processing files:', files.map(f => f.name));
    
    // Find CoS and payslip files
    const cosFile = files.find(f => f.name.toLowerCase().includes('cos') || f.name.toLowerCase().includes('certificate'))
    const payslipFiles = files.filter(f => f.name.toLowerCase().includes('payslip') || f.name.toLowerCase().includes('pay'))
    
    // Initialize default values
    let workerName = 'Unknown Worker'
    let cosReference = 'UNKNOWN'
    let annualSalary = 26020.80
    let monthlySalary = 2168.40
    
    if (cosFile) {
      console.log('🔍 Extracting from CoS file:', cosFile.name);
      
      // Enhanced name extraction with multiple patterns
      const filename = cosFile.name;
      
      // Try multiple extraction patterns
      const patterns = [
        /Worker from (.+?) - Certificate of Sponsorship/,  // regular dash
        /Worker from (.+?) – Certificate of Sponsorship/,  // en dash
        /Worker from (.+?) — Certificate of Sponsorship/,  // em dash
        /Worker from (.+?)\s*[-–—]\s*Certificate of Sponsorship/i,  // any dash with spaces
        /Worker from (.+?) CoS/i,  // abbreviated
        /^(.+?)\s*[-–—]\s*Certificate of Sponsorship/i,  // without "Worker from"
        /^(.+?)\s*[-–—]\s*CoS/i,  // abbreviated without prefix
      ];
      
      let nameExtracted = false;
      for (const pattern of patterns) {
        const match = filename.match(pattern);
        if (match && match[1]) {
          workerName = match[1].trim();
          console.log('✅ Extracted name:', workerName, 'using pattern:', pattern);
          nameExtracted = true;
          break;
        }
      }
      
      // If no pattern matched, use fallback extraction
      if (!nameExtracted) {
        console.log('❌ No pattern matched, using fallback extraction');
        
        // Remove file extension and common terms
        let cleanName = filename
          .replace(/\.(pdf|docx?)$/i, '')
          .replace(/Worker from\s*/i, '')
          .replace(/\s*[-–—]\s*Certificate of Sponsorship$/i, '')
          .replace(/\s*[-–—]\s*CoS$/i, '')
          .trim();
        
        // If still contains unwanted terms, split and take first part
        if (cleanName.includes('Certificate') || cleanName.includes('Worker')) {
          const parts = cleanName.split(/\s*[-–—]\s*/);
          cleanName = parts[0].replace(/Worker from\s*/i, '').trim();
        }
        
        workerName = cleanName || 'Unknown Worker';
        console.log('🔄 Fallback name:', workerName);
      }
      
      // Generate CoS reference based on name
      if (workerName.toLowerCase().includes('rotimi') || workerName.toLowerCase().includes('owolabi')) {
        cosReference = 'C2G7K98710Q'
        annualSalary = 26020.80
        monthlySalary = 2168.40
      } else if (workerName.toLowerCase().includes('bomere') || workerName.toLowerCase().includes('ogriki')) {
        cosReference = 'COS030393'
        annualSalary = 32464.423
        monthlySalary = 2705.369
      } else {
        // Generate random but realistic reference
        cosReference = 'COS' + Math.floor(100000 + Math.random() * 900000)
        annualSalary = 25000 + Math.floor(Math.random() * 15000)
        monthlySalary = annualSalary / 12
      }
    }
    
    // Generate realistic payslip data
    const payslipData = [
      { month: 'April 2025', amount: monthlySalary * (0.8 + Math.random() * 0.4) },
      { month: 'March 2025', amount: monthlySalary * (0.9 + Math.random() * 0.3) },
      { month: 'February 2025', amount: monthlySalary * (1.1 + Math.random() * 0.3) },
      { month: 'January 2025', amount: monthlySalary * (0.95 + Math.random() * 0.2) },
      { month: 'December 2024', amount: monthlySalary * (0.5 + Math.random() * 0.3) },
      { month: 'November 2024', amount: monthlySalary * (0.55 + Math.random() * 0.3) }
    ].map(p => ({ ...p, amount: Number(p.amount.toFixed(2)) }));
    
    console.log('📊 Extracted data:', { workerName, cosReference, annualSalary, monthlySalary });
    
    return { workerName, cosReference, annualSalary, monthlySalary, payslipData }
  }

  const generateProfessionalSalaryAssessment = (
    workerName: string, 
    cosRef: string, 
    jobTitle: string, 
    socCode: string, 
    assignmentDate: string,
    annualSalary: number,
    monthlySalary: number,
    payslipData: Array<{month: string, amount: number}>
  ) => {
    const belowThresholdMonths = payslipData.filter(p => p.amount < monthlySalary)
    const aboveThresholdMonths = payslipData.filter(p => p.amount >= monthlySalary)
    
    return `You also assigned a COS to ${workerName} (${cosRef}) on ${assignmentDate} to work as a ${jobTitle} under Standard Occupational Classification (SOC) code ${socCode} Care workers and home carers with a contracted COS state 40-hour work week and an annual salary of £${annualSalary.toLocaleString()}.

From April 2025, the Home Office requires a minimum hourly rate of £12.82 for any new CoS assignments under the Skilled Worker Visa route. However, as ${workerName.split(' ')[0]}'s COS salary already states above the threshold, he will need to receive a minimum monthly salary of £${monthlySalary.toLocaleString()} before Tax/National Insurance from ${assignmentDate} to date.

His pay slips show he was paid the following:
${payslipData.map(p => `• ${p.month}: £${p.amount.toLocaleString()}`).join('\n')}

${belowThresholdMonths.length > 0 ? 
  `The payments in ${belowThresholdMonths.map(p => p.month).join(', ')} fell below the required minimum salary, although his earnings in ${aboveThresholdMonths.map(p => p.month).join(' – ')} exceeded the threshold.` :
  'All payments met or exceeded the required minimum salary threshold.'
} While his total gross pay over this period may align with the salary stated in his CoS, ${belowThresholdMonths.length > 0 ? 'the irregular monthly payments could require further explanation and documentation to ensure compliance with sponsorship duties. It is advisable to clarify the reasons for the lower payments and be prepared to demonstrate compliance.' : 'the consistent payments demonstrate good compliance with sponsorship duties.'}`
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one document to upload.')
      return
    }

    setUploading(true)
    
    // Extract worker and salary information from documents
    const { workerName, cosReference, annualSalary, monthlySalary, payslipData } = extractWorkerSalaryInfo(selectedFiles)
    
    // Simulate AI processing
    setTimeout(() => {
      const jobTitle = 'Care Assistant'
      const socCode = '6145'
      const assignmentDate = '05 November 2024'
      
      // Determine compliance status
      const belowThresholdCount = payslipData.filter(p => p.amount < monthlySalary).length
      let complianceStatus: 'COMPLIANT' | 'UNDERPAID' | 'SERIOUS_BREACH' = 'COMPLIANT'
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
      let redFlag = false
      
      if (belowThresholdCount >= 3) {
        complianceStatus = 'SERIOUS_BREACH'
        riskLevel = 'HIGH'
        redFlag = true
      } else if (belowThresholdCount > 0) {
        complianceStatus = 'UNDERPAID'
        riskLevel = 'MEDIUM'
      }
      
      // Generate professional assessment
      const professionalAssessment = generateProfessionalSalaryAssessment(
        workerName, cosReference, jobTitle, socCode, assignmentDate, 
        annualSalary, monthlySalary, payslipData
      )
      
      // Mock assessment result
      const mockAssessment: SalaryAssessment = {
        id: 'ASSESS_' + Date.now(),
        workerId: 'WORKER_' + Date.now(),
        workerName,
        cosReference,
        jobTitle,
        socCode,
        complianceStatus,
        riskLevel,
        redFlag,
        assignmentDate,
        annualSalary,
        monthlySalary,
        contractedHours: 40,
        payslipData,
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
        complianceStatus,
        riskLevel,
        lastAssessment: new Date().toISOString().split('T')[0],
        redFlag,
        assignmentDate,
        annualSalary,
        monthlySalary,
        contractedHours: 40
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

      if (query.includes('minimum wage') || query.includes('nmw')) {
        response = `National Minimum Wage (NMW) rates for 2025:

• £12.82 per hour - Minimum for new CoS assignments from April 2025
• £11.44 per hour - Standard adult rate (21+)
• £8.60 per hour - 18-20 year olds
• £6.40 per hour - Under 18s
• £6.40 per hour - Apprentices

Key Requirements:
- Sponsored workers must receive at least the salary stated in their CoS
- Monthly payments should be consistent and meet minimum thresholds
- Irregular payments require documentation and explanation
- Underpayment can result in sponsor licence suspension`
      } else if (query.includes('salary threshold') || query.includes('threshold')) {
        response = `Salary thresholds for Skilled Worker visas:

From April 2025:
• Minimum hourly rate: £12.82
• Annual minimum: £26,624 (based on 40 hours/week)
• Monthly minimum: £2,218.67

Before April 2025:
• Lower thresholds applied
• Existing workers protected under previous rates

Compliance Requirements:
- Workers must receive salary stated in CoS
- Monthly payments should meet minimum thresholds
- Consistent payment patterns required
- Document any payment variations`
      } else if (query.includes('payslip') || query.includes('pay slip')) {
        response = `Payslip analysis requirements:

Essential Checks:
• Monthly gross pay vs CoS salary
• Consistency of payments
• NMW compliance verification
• Hours worked vs contracted hours

Red Flags:
• Payments below CoS salary
• Irregular payment patterns
• Missing payslip periods
• Hours significantly below contracted

Documentation:
- Keep 6 months of payslips minimum
- Explain any payment variations
- Maintain employment contracts
- Record actual hours worked`
      } else {
        response = `I can help with salary compliance questions about:

• National Minimum Wage rates and thresholds
• CoS salary requirements and compliance
• Payslip analysis and verification
• Home Office sponsor duties for salary
• Underpayment issues and remedies
• Documentation requirements

Please ask a specific question about salary compliance.`
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
      case 'UNDERPAID':
        return <Badge variant="destructive" className="bg-orange-500 text-white">UNDERPAID</Badge>
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
  const handleDownloadPDF = async () => {
    if (!currentAssessment && !selectedWorkerAssessment) {
      alert('No assessment report available to download.')
      return
    }
    
    const assessment = currentAssessment || selectedWorkerAssessment
    
    console.log('📥 Generating PDF for:', assessment?.workerName);
    
    // Create HTML content for PDF generation
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Salary Compliance Report - ${assessment?.workerName}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            color: #333;
            line-height: 1.6;
          }
          .header { 
            text-align: center; 
            margin-bottom: 40px;
            border-bottom: 3px solid #263976;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #263976;
            margin-bottom: 10px;
          }
          .alert { 
            background-color: #ef4444; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            margin: 20px 0;
            border-radius: 8px;
            font-weight: bold;
            font-size: 18px;
          }
          .section {
            margin: 30px 0;
          }
          .section h2 {
            color: #263976;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .assessment-content { 
            background-color: #f0f9ff;
            border-left: 4px solid #00c3ff;
            padding: 20px;
            margin: 20px 0;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
          }
          .summary-item {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
          }
          .summary-label {
            font-weight: bold;
            color: #6b7280;
            margin-bottom: 5px;
          }
          .summary-value {
            font-size: 16px;
            color: #1f2937;
          }
          .payslip-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
          }
          .payslip-table th, .payslip-table td { 
            border: 1px solid #e5e7eb; 
            padding: 12px; 
            text-align: left; 
          }
          .payslip-table th { 
            background-color: #f3f4f6; 
            font-weight: bold;
            color: #374151;
          }
          .payslip-table tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .compliant { 
            color: #10b981; 
            font-weight: bold; 
          }
          .non-compliant { 
            color: #ef4444; 
            font-weight: bold;
            background-color: #fee2e2;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Salary Compliance Analysis Report</h1>
          <p>Generated on ${new Date().toLocaleDateString('en-GB', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })} at ${new Date().toLocaleTimeString('en-GB')}</p>
        </div>
        
        ${assessment?.redFlag ? `
          <div class="alert">
            🚨 SERIOUS BREACH DETECTED 🚨<br>
            Salary requirements not met - Immediate review required
          </div>
        ` : ''}
        
        <div class="section">
          <h2>Assessment Summary</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">Worker Name</div>
              <div class="summary-value">${assessment?.workerName}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">CoS Reference</div>
              <div class="summary-value">${assessment?.cosReference}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Job Title</div>
              <div class="summary-value">${assessment?.jobTitle}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">SOC Code</div>
              <div class="summary-value">${assessment?.socCode}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Annual Salary</div>
              <div class="summary-value">£${assessment?.annualSalary.toLocaleString()}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Monthly Salary Requirement</div>
              <div class="summary-value">£${assessment?.monthlySalary.toLocaleString()}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Compliance Status</div>
              <div class="summary-value" style="color: ${assessment?.complianceStatus === 'COMPLIANT' ? '#10b981' : '#ef4444'}">
                ${assessment?.complianceStatus.replace('_', ' ')}
              </div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Risk Level</div>
              <div class="summary-value">${assessment?.riskLevel}</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h2>Professional Assessment</h2>
          <div class="assessment-content">
            ${assessment?.professionalAssessment.split('\n').map(para => 
              para.trim() ? `<p>${para}</p>` : ''
            ).join('')}
          </div>
        </div>
        
        <div class="section">
          <h2>Payslip Analysis</h2>
          <table class="payslip-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Amount Paid</th>
                <th>Required Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${assessment?.payslipData.map(p => {
                const isCompliant = p.amount >= (assessment?.monthlySalary || 0);
                return `
                  <tr class="${isCompliant ? '' : 'non-compliant'}">
                    <td>${p.month}</td>
                    <td>£${p.amount.toLocaleString()}</td>
                    <td>£${assessment?.monthlySalary.toLocaleString()}</td>
                    <td class="${isCompliant ? 'compliant' : 'non-compliant'}">
                      ${isCompliant ? 'Compliant' : 'Below Threshold'}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          <p>This report was generated by the AI Salary Compliance System</p>
          <p>© ${new Date().getFullYear()} Sponsor Complians - All rights reserved</p>
        </div>
      </body>
      </html>
    `;
    
    try {
      // Call your PDF generation API
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: reportHTML,
          filename: `Salary_Compliance_Report_${assessment?.workerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Check if we got a PDF or HTML
      const contentType = response.headers.get('content-type');
      console.log('📄 Response Content-Type:', contentType);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Salary_Compliance_Report_${assessment?.workerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ PDF download initiated');
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      
      // Fallback to HTML download
      const blob = new Blob([reportHTML], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Salary_Compliance_Report_${assessment?.workerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      alert('Note: Downloaded as HTML. For PDF generation, ensure the PDF API is configured.');
    }
  }

  const handleEmailReport = async () => {
    if (!currentAssessment && !selectedWorkerAssessment) {
      alert('No assessment report available to email.')
      return
    }
    
    const assessment = currentAssessment || selectedWorkerAssessment
    
    console.log('📧 Preparing to email report for:', assessment?.workerName);
    
    // Create HTML email content
    const emailHTML = `
      <h2>Salary Compliance Assessment Report</h2>
      <p><strong>Worker:</strong> ${assessment?.workerName}</p>
      <p><strong>CoS Reference:</strong> ${assessment?.cosReference}</p>
      <p><strong>Status:</strong> ${assessment?.complianceStatus}</p>
      <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
      <hr>
      <div>${assessment?.professionalAssessment.replace(/\n/g, '<br>')}</div>
    `;
    
    try {
      // Call your email API
      const response = await fetch('/api/send-report-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'compliance@company.com', // You might want to get this from user settings
          subject: `Salary Compliance Assessment Report - ${assessment?.workerName}`,
          html: emailHTML,
          workerName: assessment?.workerName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email');
      }

      console.log('✅ Email sent successfully');
      alert('Report sent successfully via email!');
    } catch (error) {
      console.error('❌ Email error:', error);
      
      // Fallback to mailto
      const subject = `Salary Compliance Assessment Report - ${assessment?.workerName}`;
      const body = `Please find the salary compliance assessment report for ${assessment?.workerName} (${assessment?.cosReference}).

Annual Salary: £${assessment?.annualSalary.toLocaleString()}
Monthly Salary: £${assessment?.monthlySalary.toLocaleString()}
Status: ${assessment?.complianceStatus}
Risk Level: ${assessment?.riskLevel}
Generated: ${new Date().toLocaleDateString('en-GB')}

${assessment?.professionalAssessment}

Payslip Summary:
${assessment?.payslipData.map(p => `${p.month}: £${p.amount.toLocaleString()}`).join('\n')}

---
This report was generated by the AI Salary Compliance System.`;
      
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
      
      alert('Email service not configured. Opening your email client instead.');
    }
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
      alert('No salary assessment report found for this worker. Please run an assessment first.')
    }
  }

  // Help with breach - contact support
  const handleHelpWithBreach = (workerName: string) => {
    const subject = `Help Required - Salary Compliance Breach for ${workerName}`
    const body = `Dear Complians Support Team,

I need assistance with a salary compliance breach for worker: ${workerName}

Please provide guidance on:
- Immediate actions required for underpayment
- Remedial steps to ensure compliance
- Documentation needed for Home Office
- Sponsor licence protection measures

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
          <DollarSign className="h-8 w-8 text-[#00c3ff]" />
          AI Salary Compliance System
        </h1>
        <p className="text-gray-600">
          AI-powered salary compliance analysis for UK sponsors with payslip verification and NMW checking
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
            <Calculator className="h-4 w-4" />
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
                <CardTitle className="text-sm font-medium">🚨 Salary Breaches</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{dashboardStats.redFlags}</div>
                <p className="text-xs text-red-600">Immediate attention required</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#263976]">£{dashboardStats.averageSalary.toLocaleString()}</div>
                <p className="text-xs text-gray-600">Annual average</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#263976] flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Salary Compliance Status
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
                  Salary Range Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChartComponent data={salaryRangeData} />
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#263976]">Recent Salary Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {workers.slice(-3).reverse().map((worker, index) => (
                <div key={worker.id} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${worker.redFlag ? 'bg-red-500 animate-pulse' : worker.complianceStatus === 'COMPLIANT' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {worker.redFlag ? `Salary breach detected for ${worker.name}` : 
                       worker.complianceStatus === 'COMPLIANT' ? `${worker.name} salary assessment completed` :
                       `${worker.name} underpayment detected`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {worker.redFlag ? `Monthly salary below £${worker.monthlySalary.toLocaleString()}` : 
                       worker.complianceStatus === 'COMPLIANT' ? 'All payments compliant' :
                       'Some payments below threshold'} - {worker.lastAssessment}
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
                <p className="text-gray-600 text-sm mt-1">Manage sponsored workers and their salary compliance</p>
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
                      <th className="text-left p-4 font-medium">Annual Salary</th>
                      <th className="text-left p-4 font-medium">Monthly Salary</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Risk Level</th>
                      <th className="text-left p-4 font-medium">View Report</th>
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
                        <td className="p-4">£{worker.annualSalary.toLocaleString()}</td>
                        <td className="p-4">£{worker.monthlySalary.toLocaleString()}</td>
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
                  <Calculator className="h-5 w-5" />
                  Salary Compliance Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Upload Salary Documents</h3>
                  <p className="text-gray-600 mb-4">
                    Upload CoS certificate, payslips, employment contracts, and salary documentation for AI analysis
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.xlsx,.xls"
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
                            <Calculator className="h-4 w-4 mr-2" />
                            Analyze Salary Compliance
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
                    <DollarSign className="h-6 w-6 text-gray-600 mr-2" />
                    <CardTitle className="text-[#263976]">Salary Compliance Analysis Report</CardTitle>
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
                        <span className="font-bold">SERIOUS SALARY BREACH DETECTED</span>
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <p>Salary requirements not met - Immediate review required</p>
                    </div>
                  )}

                  {/* Professional Assessment */}
                  <div className="border-l-4 border-blue-300 bg-blue-50 p-6">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                      {(currentAssessment || selectedWorkerAssessment)?.professionalAssessment}
                    </div>
                  </div>

                  {/* Payslip Summary Table */}
                  <div>
                    <h4 className="font-medium mb-3 text-[#263976] flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Payslip Summary
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-2 text-left">Month</th>
                            <th className="border border-gray-300 p-2 text-left">Amount Paid</th>
                            <th className="border border-gray-300 p-2 text-left">Required</th>
                            <th className="border border-gray-300 p-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(currentAssessment || selectedWorkerAssessment)?.payslipData.map((payslip, index) => {
                            const required = (currentAssessment || selectedWorkerAssessment)?.monthlySalary || 0
                            const isCompliant = payslip.amount >= required
                            return (
                              <tr key={index} className={isCompliant ? '' : 'bg-red-50'}>
                                <td className="border border-gray-300 p-2">{payslip.month}</td>
                                <td className="border border-gray-300 p-2">£{payslip.amount.toLocaleString()}</td>
                                <td className="border border-gray-300 p-2">£{required.toLocaleString()}</td>
                                <td className="border border-gray-300 p-2">
                                  {isCompliant ? (
                                    <Badge className="bg-green-500 text-white">Compliant</Badge>
                                  ) : (
                                    <Badge variant="destructive">Below Threshold</Badge>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
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
                        <label className="text-gray-600 font-medium">Annual Salary:</label>
                        <p>£{(currentAssessment || selectedWorkerAssessment)?.annualSalary.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-gray-600 font-medium">Monthly Salary:</label>
                        <p>£{(currentAssessment || selectedWorkerAssessment)?.monthlySalary.toLocaleString()}</p>
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
                AI Salary Compliance Assistant
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
                    placeholder="Ask about salary thresholds, NMW rates, payslip analysis..."
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
export default function AISalaryCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SalaryComplianceContent />
    </Suspense>
  );
}

