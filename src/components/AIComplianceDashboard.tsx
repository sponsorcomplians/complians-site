'use client'

import { useState } from 'react'
import { 
  BarChart3, 
  Users, 
  FileText, 
  MessageSquare, 
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle
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
  onClick,
  ...props 
}: { 
  children: React.ReactNode; 
  className?: string; 
  size?: 'default' | 'sm';
  onClick?: () => void;
  [key: string]: any;
}) => {
  const sizeClasses = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'
  return (
    <button 
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${sizeClasses} ${className}`}
      onClick={onClick}
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
  variant?: 'default' | 'outline';
  className?: string;
}) => {
  const variantClasses = variant === 'outline' 
    ? 'border border-current bg-transparent' 
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

export default function AIComplianceDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#263976] mb-2">
          AI Qualification Compliance System
        </h1>
        <p className="text-gray-600">
          AI-powered qualification compliance analysis for UK sponsors
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
                <Users className="h-4 w-4 text-[#00c3ff]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#263976]">12</div>
                <p className="text-xs text-gray-600">+2 from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#263976]">85%</div>
                <p className="text-xs text-gray-600">+5% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Risk Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#263976]">3</div>
                <p className="text-xs text-gray-600">Requires attention</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workers Tab */}
        <TabsContent value="workers" activeTab={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle className="text-[#263976]">Worker Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">John Smith</h3>
                    <p className="text-sm text-gray-600">Software Developer - SOC 2136</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Compliant
                    </Badge>
                    <Button size="sm" className="bg-[#263976] hover:bg-[#1e2a5a] text-white">
                      View Report
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Sarah Johnson</h3>
                    <p className="text-sm text-gray-600">Data Analyst - SOC 2425</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      Non-Compliant
                    </Badge>
                    <Button size="sm" className="bg-[#263976] hover:bg-[#1e2a5a] text-white">
                      View Report
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessment Tab */}
        <TabsContent value="assessment" activeTab={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle className="text-[#263976]">Document Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Compliance Documents</h3>
                <p className="text-gray-600 mb-4">
                  Upload CV, CoS certificates, qualification documents, and application forms
                </p>
                <Button className="bg-[#00c3ff] hover:bg-[#0099cc] text-white">
                  Choose Files
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai-assistant" activeTab={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle className="text-[#263976]">AI Compliance Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-64 border rounded-lg p-4 bg-gray-50 overflow-y-auto">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm"><strong>AI:</strong> Hello! I'm your AI compliance assistant. How can I help you today?</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ask about compliance requirements..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c3ff]"
                  />
                  <Button className="bg-[#263976] hover:bg-[#1e2a5a] text-white">
                    Send
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

