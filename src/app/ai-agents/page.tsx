'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  Bot, 
  CheckCircle, 
  Star, 
  ArrowRight, 
  Users, 
  FileText, 
  Shield, 
  Zap,
  DollarSign,
  GraduationCap,
  Clock,
  AlertTriangle,
  BarChart3,
  MessageSquare,
  Download,
  Mail,
  Printer,
  Eye,
  HelpCircle,
  Sparkles,
  Target,
  TrendingUp,
  Lock,
  Globe,
  Smartphone
} from 'lucide-react'

// Custom Card Components
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${className}`}>
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
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  onClick?: () => void;
  disabled?: boolean;
  [key: string]: any;
}) => {
  const sizeClasses = size === 'sm' ? 'px-3 py-1.5 text-sm' : size === 'lg' ? 'px-8 py-3 text-lg' : 'px-4 py-2'
  const variantClasses = variant === 'destructive' 
    ? 'bg-red-500 hover:bg-red-600 text-white' 
    : variant === 'outline'
    ? 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-900'
    : variant === 'secondary'
    ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
    : 'bg-[#263976] hover:bg-[#1e2a5a] text-white'
  
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
  variant?: 'default' | 'outline' | 'destructive' | 'success';
  className?: string;
}) => {
  const variantClasses = variant === 'outline' 
    ? 'border border-current bg-transparent' 
    : variant === 'destructive'
    ? 'bg-red-500 text-white'
    : variant === 'success'
    ? 'bg-green-500 text-white'
    : 'bg-[#263976] text-white'
  
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variantClasses} ${className}`}>
      {children}
    </div>
  )
}

interface AIAgent {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  price: string
  originalPrice?: string
  features: string[]
  keyBenefits: string[]
  status: 'available' | 'coming-soon' | 'beta'
  category: 'compliance' | 'hr' | 'finance' | 'operations'
  complexity: 'basic' | 'advanced' | 'enterprise'
  href: string
  popular?: boolean
  new?: boolean
  showcaseImage?: string
}

const aiAgents: AIAgent[] = [
  {
    id: 'qualification-compliance',
    name: 'AI Qualification Compliance Agent',
    description: 'Advanced AI-powered qualification verification and compliance checking for UK sponsors with red flag detection and expert-level assessment.',
    icon: <GraduationCap className="h-8 w-8" />,
    price: '£199.99',
    originalPrice: '£299.99',
    features: [
      'Document upload and AI analysis',
      'Expert-level qualification assessment',
      'Red flag detection for serious breaches',
      'Professional paragraph reports',
      'Care Certificate verification',
      'SOC code compliance checking',
      'Dashboard with analytics',
      'AI chat assistant',
      'Download, email, and print reports',
      'Worker management system'
    ],
    keyBenefits: [
      'Automated compliance checking',
      'Expert-level analysis quality',
      'Immediate breach detection',
      'Professional reporting',
      'Time-saving automation'
    ],
    status: 'available',
    category: 'compliance',
    complexity: 'advanced',
    href: '/ai-compliance',
    popular: true,
    new: false,
    showcaseImage: '/images/ai-qualification-showcase.png'
  },
  {
    id: 'salary-compliance',
    name: 'AI Salary Compliance Agent',
    description: 'Comprehensive salary compliance analysis with payslip verification, NMW checking, and Home Office threshold monitoring.',
    icon: <DollarSign className="h-8 w-8" />,
    price: '£179.99',
    originalPrice: '£249.99',
    features: [
      'Payslip analysis and verification',
      'National Minimum Wage checking',
      'Home Office threshold monitoring',
      'Monthly payment tracking',
      'Underpayment detection',
      'Professional assessment reports',
      'Salary compliance dashboard',
      'AI salary assistant',
      'Report generation and sharing',
      'Worker salary management'
    ],
    keyBenefits: [
      'Automated salary verification',
      'NMW compliance assurance',
      'Underpayment prevention',
      'Professional documentation',
      'Sponsor duty compliance'
    ],
    status: 'available',
    category: 'compliance',
    complexity: 'advanced',
    href: '/ai-salary-compliance',
    popular: false,
    new: true,
    showcaseImage: '/images/ai-salary-showcase.png'
  },
  {
    id: 'experience-compliance',
    name: 'AI Experience Compliance Agent',
    description: 'Intelligent work experience verification and skills assessment for sponsored worker compliance.',
    icon: <Users className="h-8 w-8" />,
    price: '£149.99',
    features: [
      'Work experience verification',
      'Skills assessment analysis',
      'CV and reference checking',
      'Experience compliance reports',
      'Professional background verification'
    ],
    keyBenefits: [
      'Automated experience verification',
      'Skills gap analysis',
      'Professional documentation',
      'Compliance assurance'
    ],
    status: 'coming-soon',
    category: 'compliance',
    complexity: 'advanced',
    href: '#',
    popular: false,
    new: false
  },
  {
    id: 'document-compliance',
    name: 'AI Document Compliance Agent',
    description: 'Comprehensive document verification and compliance checking for all sponsor requirements.',
    icon: <FileText className="h-8 w-8" />,
    price: '£129.99',
    features: [
      'Document authenticity verification',
      'Compliance document checking',
      'Missing document alerts',
      'Document expiry tracking',
      'Automated compliance reports'
    ],
    keyBenefits: [
      'Complete document oversight',
      'Authenticity verification',
      'Expiry management',
      'Compliance assurance'
    ],
    status: 'coming-soon',
    category: 'compliance',
    complexity: 'basic',
    href: '#',
    popular: false,
    new: false
  },
  {
    id: 'right-to-work',
    name: 'AI Right to Work Agent',
    description: 'Automated right to work checking and verification with Home Office integration.',
    icon: <Shield className="h-8 w-8" />,
    price: '£159.99',
    features: [
      'Right to work verification',
      'Home Office status checking',
      'Visa expiry monitoring',
      'Automated compliance alerts',
      'RTW documentation management'
    ],
    keyBenefits: [
      'Automated RTW checking',
      'Real-time status updates',
      'Compliance monitoring',
      'Legal protection'
    ],
    status: 'coming-soon',
    category: 'compliance',
    complexity: 'advanced',
    href: '#',
    popular: false,
    new: false
  },
  {
    id: 'hr-compliance',
    name: 'AI HR Compliance Agent',
    description: 'Complete HR compliance management with policy checking and employee monitoring.',
    icon: <Users className="h-8 w-8" />,
    price: '£189.99',
    features: [
      'HR policy compliance',
      'Employee record management',
      'Training compliance tracking',
      'Performance monitoring',
      'HR compliance reporting'
    ],
    keyBenefits: [
      'Complete HR oversight',
      'Policy compliance',
      'Training management',
      'Performance tracking'
    ],
    status: 'coming-soon',
    category: 'hr',
    complexity: 'enterprise',
    href: '#',
    popular: false,
    new: false
  }
]

export default function AIAgentsProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedComplexity, setSelectedComplexity] = useState<string>('all')

  const categories = [
    { id: 'all', name: 'All Agents', count: aiAgents.length },
    { id: 'compliance', name: 'Compliance', count: aiAgents.filter(a => a.category === 'compliance').length },
    { id: 'hr', name: 'HR Management', count: aiAgents.filter(a => a.category === 'hr').length },
    { id: 'finance', name: 'Finance', count: aiAgents.filter(a => a.category === 'finance').length },
    { id: 'operations', name: 'Operations', count: aiAgents.filter(a => a.category === 'operations').length }
  ]

  const complexityLevels = [
    { id: 'all', name: 'All Levels' },
    { id: 'basic', name: 'Basic' },
    { id: 'advanced', name: 'Advanced' },
    { id: 'enterprise', name: 'Enterprise' }
  ]

  const filteredAgents = aiAgents.filter(agent => {
    const categoryMatch = selectedCategory === 'all' || agent.category === selectedCategory
    const complexityMatch = selectedComplexity === 'all' || agent.complexity === selectedComplexity
    return categoryMatch && complexityMatch
  })

  const handleGetStarted = (agent: AIAgent) => {
    if (agent.status === 'available') {
      window.location.href = agent.href
    } else {
      // Handle coming soon - maybe show interest form
      alert(`${agent.name} is coming soon! We'll notify you when it's available.`)
    }
  }

  const handleLearnMore = (agent: AIAgent) => {
    // Scroll to agent details or open modal
    alert(`Learn more about ${agent.name} - detailed information coming soon!`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Showcase Images */}
      <div className="bg-gradient-to-r from-[#263976] to-[#00c3ff] text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Bot className="h-12 w-12 mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold">AI Compliance Agents</h1>
            </div>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Revolutionize your compliance management with our suite of intelligent AI agents
            </p>
            <p className="text-lg mb-8 opacity-80">
              From qualification verification to salary compliance, our AI agents provide expert-level analysis, 
              automated reporting, and real-time compliance monitoring for UK sponsors.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Expert-Level Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Real-Time Monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Professional Reporting</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>24/7 Availability</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured AI Agents Showcase */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#263976] mb-4">Featured AI Agents</h2>
            <p className="text-lg text-gray-600">Our most popular AI-powered compliance solutions</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* AI Qualification Compliance Agent */}
            <div className="text-center">
              <div className="mb-6">
                <Image
                  src="/images/ai-qualification-showcase.png"
                  alt="AI Qualification Compliance Agent"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg mx-auto"
                />
              </div>
              <h3 className="text-2xl font-bold text-[#263976] mb-3">AI Qualification Compliance Agent</h3>
              <p className="text-gray-600 mb-4">
                Advanced AI-powered qualification verification with red flag detection and expert-level assessment
              </p>
              <div className="flex items-center justify-center gap-4 mb-4">
                <Badge variant="success" className="bg-[#00c3ff] text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
                <span className="text-2xl font-bold text-[#263976]">£199.99</span>
                <span className="text-lg text-gray-500 line-through">£299.99</span>
              </div>
              <Button onClick={() => window.location.href = '/ai-compliance'} className="w-full max-w-xs">
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* AI Salary Compliance Agent */}
            <div className="text-center">
              <div className="mb-6">
                <Image
                  src="/images/ai-salary-showcase.png"
                  alt="AI Salary Compliance Agent"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg mx-auto"
                />
              </div>
              <h3 className="text-2xl font-bold text-[#263976] mb-3">AI Salary Compliance Agent</h3>
              <p className="text-gray-600 mb-4">
                Comprehensive salary compliance analysis with payslip verification and NMW checking
              </p>
              <div className="flex items-center justify-center gap-4 mb-4">
                <Badge className="bg-green-500 text-white">
                  <Sparkles className="h-3 w-3 mr-1" />
                  New
                </Badge>
                <span className="text-2xl font-bold text-[#263976]">£179.99</span>
                <span className="text-lg text-gray-500 line-through">£249.99</span>
              </div>
              <Button onClick={() => window.location.href = '/ai-salary-compliance'} className="w-full max-w-xs">
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-12 border-b">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-[#263976] mb-2">{aiAgents.filter(a => a.status === 'available').length}</div>
              <div className="text-gray-600">Available Now</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#263976] mb-2">{aiAgents.filter(a => a.status === 'coming-soon').length}</div>
              <div className="text-gray-600">Coming Soon</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#263976] mb-2">20</div>
              <div className="text-gray-600">Total Planned</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#263976] mb-2">100%</div>
              <div className="text-gray-600">UK Compliant</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white py-8 border-b">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 self-center mr-2">Category:</span>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-[#263976] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 self-center mr-2">Level:</span>
              {complexityLevels.map(level => (
                <button
                  key={level.id}
                  onClick={() => setSelectedComplexity(level.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedComplexity === level.id
                      ? 'bg-[#00c3ff] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#263976] mb-4">All AI Compliance Agents</h2>
          <p className="text-gray-600">Choose from our complete suite of AI-powered compliance solutions</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAgents.map((agent) => (
            <Card key={agent.id} className={`relative ${agent.popular ? 'ring-2 ring-[#00c3ff]' : ''}`}>
              {/* Showcase Image for Available Agents */}
              {agent.showcaseImage && agent.status === 'available' && (
                <div className="p-4 pb-2">
                  <Image
                    src={agent.showcaseImage}
                    alt={agent.name}
                    width={400}
                    height={250}
                    className="rounded-lg w-full h-48 object-cover"
                  />
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {agent.popular && (
                  <Badge variant="success" className="bg-[#00c3ff] text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                )}
                {agent.new && (
                  <Badge className="bg-green-500 text-white">
                    <Sparkles className="h-3 w-3 mr-1" />
                    New
                  </Badge>
                )}
                {agent.status === 'coming-soon' && (
                  <Badge variant="outline" className="bg-gray-100 text-gray-600">
                    Coming Soon
                  </Badge>
                )}
              </div>

              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-[#263976] text-white rounded-lg">
                    {agent.icon}
                  </div>
                  <div>
                    <CardTitle className="text-[#263976]">{agent.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {agent.complexity}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {agent.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{agent.description}</p>
              </CardHeader>

              <CardContent>
                {/* Pricing */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-[#263976]">{agent.price}</span>
                  {agent.originalPrice && (
                    <span className="text-lg text-gray-500 line-through">{agent.originalPrice}</span>
                  )}
                </div>

                {/* Key Benefits */}
                <div className="mb-4">
                  <h4 className="font-semibold text-sm text-gray-900 mb-2">Key Benefits:</h4>
                  <ul className="space-y-1">
                    {agent.keyBenefits.slice(0, 3).map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleGetStarted(agent)}
                    disabled={agent.status === 'coming-soon'}
                    className="flex-1"
                  >
                    {agent.status === 'available' ? 'Get Started' : 'Coming Soon'}
                    {agent.status === 'available' && <ArrowRight className="h-4 w-4 ml-2" />}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleLearnMore(agent)}
                    className="px-3"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Why Choose Our AI Agents */}
      <div className="bg-[#263976] text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our AI Agents?</h2>
            <p className="text-xl opacity-90">Advanced AI technology meets compliance expertise</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00c3ff] rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Expert-Level Analysis</h3>
              <p className="text-sm opacity-80">AI that matches human expert assessment quality</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00c3ff] rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant Processing</h3>
              <p className="text-sm opacity-80">Get compliance reports in seconds, not hours</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00c3ff] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">100% UK Compliant</h3>
              <p className="text-sm opacity-80">Built specifically for UK sponsor requirements</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00c3ff] rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Continuous Learning</h3>
              <p className="text-sm opacity-80">AI that improves with every assessment</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#00c3ff] to-[#263976] text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Transform Your Compliance Management Today</h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of UK sponsors who trust our AI agents for their compliance needs
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-white text-[#263976] hover:bg-gray-100"
              onClick={() => window.location.href = '/ai-compliance'}
            >
              Start with Qualification Agent
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-[#263976]"
              onClick={() => window.location.href = '/ai-salary-compliance'}
            >
              Try Salary Agent
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
          <p className="text-sm mt-6 opacity-80">
            No subscription required • One-time purchase • Instant access
          </p>
        </div>
      </div>
    </div>
  )
}

