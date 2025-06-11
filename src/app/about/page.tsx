'use client'

import { 
  Users, 
  Target, 
  Award, 
  Shield, 
  Bot, 
  TrendingUp, 
  Globe, 
  CheckCircle,
  Star,
  ArrowRight,
  Lightbulb,
  Heart,
  Zap,
  Lock,
  Clock,
  MessageSquare
} from 'lucide-react'

// Custom Components
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
)

const Button = ({ 
  children, 
  className = '', 
  variant = 'default',
  onClick 
}: { 
  children: React.ReactNode; 
  className?: string; 
  variant?: 'default' | 'outline';
  onClick?: () => void;
}) => {
  const variantClasses = variant === 'outline'
    ? 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-900'
    : 'bg-[#263976] hover:bg-[#1e2a5a] text-white'
  
  return (
    <button 
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${variantClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default function AboutUsPage() {
  const stats = [
    { number: '500+', label: 'Sponsors Served', icon: <Users className="h-6 w-6" /> },
    { number: '2', label: 'AI Agents Live', icon: <Bot className="h-6 w-6" /> },
    { number: '18', label: 'More Agents Coming', icon: <TrendingUp className="h-6 w-6" /> },
    { number: '99.9%', label: 'Accuracy Rate', icon: <Target className="h-6 w-6" /> }
  ]

  const values = [
    {
      icon: <Shield className="h-8 w-8 text-[#00c3ff]" />,
      title: 'Compliance Excellence',
      description: 'We maintain the highest standards of compliance expertise, ensuring our solutions meet and exceed regulatory requirements.'
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-[#00c3ff]" />,
      title: 'Innovation First',
      description: 'We leverage cutting-edge AI technology to transform traditional compliance processes into intelligent, automated solutions.'
    },
    {
      icon: <Heart className="h-8 w-8 text-[#00c3ff]" />,
      title: 'Client Success',
      description: 'Your success is our priority. We build solutions that genuinely solve real-world compliance challenges for sponsors.'
    },
    {
      icon: <Lock className="h-8 w-8 text-[#00c3ff]" />,
      title: 'Trust & Security',
      description: 'We handle sensitive compliance data with the utmost care, using enterprise-grade security and privacy protection.'
    }
  ]

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & CEO',
      bio: 'Former Home Office compliance specialist with 15+ years experience in sponsor licensing and immigration law.',
      expertise: ['Sponsor Compliance', 'Immigration Law', 'Regulatory Affairs']
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Chief Technology Officer',
      bio: 'AI researcher and former Google engineer specialising in natural language processing and compliance automation.',
      expertise: ['Artificial Intelligence', 'Machine Learning', 'Compliance Tech']
    },
    {
      name: 'Emma Williams',
      role: 'Head of Compliance',
      bio: 'Chartered legal executive with expertise in employment law and sponsor duties under the Immigration Rules.',
      expertise: ['Employment Law', 'Sponsor Duties', 'Legal Compliance']
    },
    {
      name: 'James Rodriguez',
      role: 'Lead AI Engineer',
      bio: 'Full-stack developer and AI specialist focused on building intelligent compliance solutions for the immigration sector.',
      expertise: ['AI Development', 'Full-Stack Engineering', 'Compliance Systems']
    }
  ]

  const milestones = [
    {
      year: '2022',
      title: 'Company Founded',
      description: 'Complians was established with a mission to revolutionise sponsor compliance through technology.'
    },
    {
      year: '2023',
      title: 'First Digital Tools',
      description: 'Launched our suite of digital compliance tools, serving over 100 sponsors in the first year.'
    },
    {
      year: '2024',
      title: 'AI Revolution Begins',
      description: 'Introduced our first AI agents, transforming how sponsors manage qualification and salary compliance.'
    },
    {
      year: '2025',
      title: 'Full AI Suite',
      description: 'Expanding to 20 AI agents covering every aspect of sponsor compliance and immigration requirements.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#263976] to-[#00c3ff] text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Complians</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Pioneering the future of sponsor compliance through artificial intelligence
            </p>
            <p className="text-lg opacity-80 leading-relaxed">
              We're transforming how UK sponsors manage their compliance obligations by combining 
              deep regulatory expertise with cutting-edge AI technology. Our mission is to make 
              compliance simple, accurate, and accessible for every sponsor.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-[#263976] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-[#263976] mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#263976] mb-4">Our Story</h2>
              <p className="text-lg text-gray-600">From compliance challenges to AI solutions</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-[#263976] mb-6">The Problem We Saw</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    As former compliance professionals, we witnessed firsthand the challenges UK sponsors 
                    face in managing their regulatory obligations. Manual processes, inconsistent assessments, 
                    and the constant fear of compliance breaches were creating unnecessary stress and risk.
                  </p>
                  <p>
                    Traditional compliance checking was time-consuming, expensive, and often inconsistent. 
                    Sponsors needed a better way to ensure they met their duties whilst focusing on their 
                    core business operations.
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-[#263976] mb-6">Our Solution</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    We combined our deep compliance expertise with advanced artificial intelligence to 
                    create solutions that match expert-level analysis whilst being accessible to every sponsor.
                  </p>
                  <p>
                    Our AI agents don't just automate processes – they provide intelligent, contextual 
                    analysis that helps sponsors understand their compliance status and take appropriate action.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#263976] mb-4">Our Values</h2>
            <p className="text-lg text-gray-600">The principles that guide everything we do</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {values.map((value, index) => (
              <Card key={index} className="p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {value.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#263976] mb-3">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#263976] mb-4">Our Journey</h2>
            <p className="text-lg text-gray-600">Key milestones in our mission to transform compliance</p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#00c3ff] text-white rounded-full flex items-center justify-center font-bold">
                      {milestone.year}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#263976] mb-2">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#263976] mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600">Compliance experts and AI specialists working together</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="p-6">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-[#263976] to-[#00c3ff] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#263976] mb-1">{member.name}</h3>
                  <p className="text-[#00c3ff] font-medium mb-3">{member.role}</p>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{member.bio}</p>
                
                <div className="flex flex-wrap gap-2">
                  {member.expertise.map((skill, skillIndex) => (
                    <span 
                      key={skillIndex}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Technology & Approach */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#263976] mb-4">Our Technology</h2>
              <p className="text-lg text-gray-600">How we build intelligent compliance solutions</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-6 text-center">
                <div className="w-16 h-16 bg-[#263976] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-[#263976] mb-3">Advanced AI</h3>
                <p className="text-gray-600 text-sm">
                  Our AI agents use natural language processing and machine learning to understand 
                  complex compliance requirements and provide expert-level analysis.
                </p>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="w-16 h-16 bg-[#263976] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-[#263976] mb-3">Regulatory Expertise</h3>
                <p className="text-gray-600 text-sm">
                  Every AI agent is trained on current UK immigration rules and sponsor guidance, 
                  ensuring accurate and up-to-date compliance assessments.
                </p>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="w-16 h-16 bg-[#263976] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-[#263976] mb-3">Continuous Learning</h3>
                <p className="text-gray-600 text-sm">
                  Our AI systems continuously learn and improve, staying current with regulatory 
                  changes and enhancing accuracy with every assessment.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Certifications & Compliance */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#263976] mb-4">Trust & Compliance</h2>
            <p className="text-lg text-gray-600">Our commitment to security and regulatory standards</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card className="p-6 text-center">
              <Award className="h-12 w-12 text-[#00c3ff] mx-auto mb-3" />
              <h3 className="font-semibold text-[#263976] mb-2">GDPR Compliant</h3>
              <p className="text-sm text-gray-600">Full compliance with data protection regulations</p>
            </Card>
            
            <Card className="p-6 text-center">
              <Lock className="h-12 w-12 text-[#00c3ff] mx-auto mb-3" />
              <h3 className="font-semibold text-[#263976] mb-2">ISO 27001</h3>
              <p className="text-sm text-gray-600">Information security management standards</p>
            </Card>
            
            <Card className="p-6 text-center">
              <Shield className="h-12 w-12 text-[#00c3ff] mx-auto mb-3" />
              <h3 className="font-semibold text-[#263976] mb-2">SOC 2 Type II</h3>
              <p className="text-sm text-gray-600">Audited security and availability controls</p>
            </Card>
            
            <Card className="p-6 text-center">
              <Globe className="h-12 w-12 text-[#00c3ff] mx-auto mb-3" />
              <h3 className="font-semibold text-[#263976] mb-2">UK Based</h3>
              <p className="text-sm text-gray-600">Data processed and stored within the UK</p>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#263976] to-[#00c3ff] text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Compliance?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of UK sponsors who trust Complians for their compliance needs
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              className="bg-white text-[#263976] hover:bg-gray-100"
              onClick={() => window.location.href = '/ai-agents'}
            >
              Explore AI Agents
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-[#263976]"
              onClick={() => window.location.href = '/contact'}
            >
              Contact Our Team
              <MessageSquare className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

