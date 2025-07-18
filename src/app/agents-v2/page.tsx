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
  Smartphone,
  Building
} from 'lucide-react'

// Import isolated components
import { Card, CardHeader, CardTitle, CardContent } from '@/components/agents-v2/Card'
import { Button } from '@/components/agents-v2/Button'
import { Badge } from '@/components/agents-v2/Badge'
import { Icon } from '@/components/agents-v2/IconMap'
import { aiAgents } from '@/components/agents-v2/data'
import { AIAgent } from '@/components/agents-v2/types'
import { UIToggle } from '@/components/agents-v2'

export default function AgentsV2Page() {
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
      // Navigate directly to the agent page
      window.location.href = agent.href;
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
      <UIToggle currentPage="new" />
      {/* Hero Section with Showcase Images */}
      <div className="bg-gradient-to-r from-[#263976] to-[#00c3ff] text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Bot className="h-12 w-12 mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold">AI Compliance Agents V2</h1>
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
              <Button onClick={() => window.location.href = '/ai-qualification-compliance'} className="w-full max-w-xs">
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
              <div className="text-3xl font-bold text-[#263976] mb-2">3</div>
              <div className="text-gray-600">Available Now</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#263976] mb-2">11</div>
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
                    <Icon name={agent.icon} />
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
              onClick={() => window.location.href = '/ai-qualification-compliance'}
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