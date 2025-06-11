'use client'

import { useState } from 'react'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare, 
  HelpCircle, 
  Shield, 
  Users,
  CheckCircle,
  ArrowRight,
  Bot,
  Headphones,
  FileText,
  AlertCircle
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
  type = 'button',
  onClick,
  disabled = false 
}: { 
  children: React.ReactNode; 
  className?: string; 
  variant?: 'default' | 'outline';
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
}) => {
  const variantClasses = variant === 'outline'
    ? 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-900'
    : 'bg-[#263976] hover:bg-[#1e2a5a] text-white'
  
  return (
    <button 
      type={type}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${variantClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
    }, 1000)
  }

  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email Support',
      description: 'Get help with your compliance questions',
      contact: 'support@complians.co.uk',
      action: 'mailto:support@complians.co.uk'
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Phone Support',
      description: 'Speak directly with our compliance experts',
      contact: '+44 (0) 20 1234 5678',
      action: 'tel:+442012345678'
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: 'Live Chat',
      description: 'Instant support during business hours',
      contact: 'Available 9 AM - 6 PM GMT',
      action: '#'
    }
  ]

  const supportOptions = [
    {
      icon: <Bot className="h-6 w-6 text-[#00c3ff]" />,
      title: 'AI Agent Support',
      description: 'Technical assistance with your AI compliance agents',
      email: 'ai-support@complians.co.uk'
    },
    {
      icon: <Shield className="h-6 w-6 text-green-500" />,
      title: 'Compliance Consultation',
      description: 'Expert guidance on sponsor compliance requirements',
      email: 'compliance@complians.co.uk'
    },
    {
      icon: <FileText className="h-6 w-6 text-blue-500" />,
      title: 'Product Support',
      description: 'Help with digital tools and templates',
      email: 'products@complians.co.uk'
    },
    {
      icon: <Users className="h-6 w-6 text-purple-500" />,
      title: 'Sales & Partnerships',
      description: 'Discuss enterprise solutions and partnerships',
      email: 'sales@complians.co.uk'
    }
  ]

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for contacting us. We'll get back to you within 24 hours.
            </p>
            <Button onClick={() => setSubmitted(false)} className="w-full">
              Send Another Message
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#263976] to-[#00c3ff] text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Expert support for all your sponsor compliance needs
            </p>
            <p className="text-lg opacity-80">
              Whether you need help with our AI agents, compliance guidance, or technical support, 
              our team of experts is here to assist you.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#263976] mb-4">How Can We Help?</h2>
            <p className="text-lg text-gray-600">Choose the best way to reach our team</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {contactMethods.map((method, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-[#263976] text-white rounded-lg flex items-center justify-center mx-auto mb-4">
                  {method.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-gray-600 mb-4">{method.description}</p>
                <a 
                  href={method.action}
                  className="text-[#00c3ff] hover:text-[#263976] font-medium transition-colors"
                >
                  {method.contact}
                </a>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form and Support Options */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div>
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-[#263976] mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00c3ff] focus:border-transparent"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00c3ff] focus:border-transparent"
                        placeholder="your.email@company.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                      Company/Organisation
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00c3ff] focus:border-transparent"
                      placeholder="Your company name"
                    />
                  </div>

                  <div>
                    <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700 mb-2">
                      Inquiry Type *
                    </label>
                    <select
                      id="inquiryType"
                      name="inquiryType"
                      required
                      value={formData.inquiryType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00c3ff] focus:border-transparent"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="ai-support">AI Agent Support</option>
                      <option value="compliance">Compliance Consultation</option>
                      <option value="technical">Technical Support</option>
                      <option value="sales">Sales & Partnerships</option>
                      <option value="billing">Billing & Accounts</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00c3ff] focus:border-transparent"
                      placeholder="Brief description of your inquiry"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00c3ff] focus:border-transparent"
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Support Options */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#263976] mb-6">Specialised Support</h2>
                <p className="text-gray-600 mb-8">
                  Get targeted assistance from our specialist teams for faster resolution.
                </p>
              </div>

              <div className="space-y-4">
                {supportOptions.map((option, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
                        <p className="text-gray-600 mb-3">{option.description}</p>
                        <a 
                          href={`mailto:${option.email}`}
                          className="text-[#00c3ff] hover:text-[#263976] font-medium transition-colors inline-flex items-center"
                        >
                          {option.email}
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </a>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Business Hours */}
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#00c3ff] text-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Hours</h3>
                    <div className="space-y-1 text-gray-600">
                      <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM GMT</p>
                      <p><strong>Saturday:</strong> 10:00 AM - 4:00 PM GMT</p>
                      <p><strong>Sunday:</strong> Closed</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-3">
                      Emergency compliance support available 24/7 for enterprise clients
                    </p>
                  </div>
                </div>
              </Card>

              {/* Office Location */}
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#263976] text-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Office Location</h3>
                    <div className="text-gray-600">
                      <p>Complians Ltd</p>
                      <p>123 Compliance Street</p>
                      <p>London, EC1A 1BB</p>
                      <p>United Kingdom</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#263976] mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">Quick answers to common questions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-[#00c3ff] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">How quickly do AI agents process documents?</h3>
                  <p className="text-gray-600 text-sm">Our AI agents typically process and analyse documents within 30-60 seconds, providing instant compliance reports.</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-[#00c3ff] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Do you offer training on using the AI agents?</h3>
                  <p className="text-gray-600 text-sm">Yes, we provide comprehensive training materials, video tutorials, and one-on-one support sessions for all our AI agents.</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-[#00c3ff] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Is my data secure with your AI agents?</h3>
                  <p className="text-gray-600 text-sm">Absolutely. We use enterprise-grade encryption and comply with GDPR. Your data is processed securely and never stored permanently.</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-[#00c3ff] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Can I get a refund if I'm not satisfied?</h3>
                  <p className="text-gray-600 text-sm">We offer a 30-day money-back guarantee on all our products. Contact us if you're not completely satisfied.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

