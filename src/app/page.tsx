import { getFeaturedProducts } from '@/lib/products'
import ProductCard from '@/components/ProductCard'
import Button from '@/components/Button'
import Link from 'next/link'
import { Shield, Users, Clock, Download, CheckCircle, Star, Bot, Zap, BarChart3, FileText, Brain, Sparkles } from 'lucide-react'

export default async function Home() {
  const featuredProducts = await getFeaturedProducts()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#263976] to-[#1e2a5a] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Revolutionary AI-Powered
              <span className="text-[#00c3ff]"> Sponsor Compliance</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Advanced AI agents and digital tools designed by immigration experts 
              to automate sponsor compliance, detect breaches instantly, and deliver expert-level assessments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/ai-agents">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                  <Bot className="w-5 h-5 mr-2" />
                  Explore AI Agents
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-[#263976]">
                  <FileText className="w-5 h-5 mr-2" />
                  Digital Tools
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm opacity-90">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>AI-Powered Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Instant Breach Detection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Expert-Level Reports</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>24/7 Automation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Agents Showcase */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-[#263976] mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">
                AI Sponsor Compliance Agents
              </h2>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Revolutionary AI agents that provide expert-level compliance analysis, 
              automated breach detection, and professional assessment reports
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-[#263976] to-[#1e2a5a] text-white rounded-xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#00c3ff] rounded-lg flex items-center justify-center mr-4">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">AI Qualification Compliance Agent</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Advanced AI analysis of worker qualifications with red flag detection for serious breaches. 
                Provides expert-level assessment reports in your professional writing style.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-[#00c3ff]" />
                  <span>Document upload and AI analysis</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-[#00c3ff]" />
                  <span>Red flag detection for serious breaches</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-[#00c3ff]" />
                  <span>Professional paragraph reports</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">£199.99</span>
                <Link href="/ai-compliance">
                  <Button variant="secondary" size="sm">
                    Try Now
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#00c3ff] to-[#0099cc] text-white rounded-xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4">
                  <BarChart3 className="w-6 h-6 text-[#00c3ff]" />
                </div>
                <h3 className="text-xl font-bold">AI Salary Compliance Agent</h3>
              </div>
              <p className="text-gray-100 mb-6">
                Comprehensive salary compliance analysis with payslip verification, 
                NMW checking, and Home Office threshold monitoring.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span>Payslip analysis and verification</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span>Underpayment detection</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span>Professional assessment reports</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">£179.99</span>
                <Link href="/ai-salary-compliance">
                  <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-[#00c3ff]">
                    Try Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/ai-agents">
              <Button size="lg" className="text-lg px-8 py-4">
                <Sparkles className="w-5 h-5 mr-2" />
                View All AI Agents
              </Button>
            </Link>
            <p className="text-sm text-gray-500 mt-4">18 more AI agents coming soon</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Complians?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trusted by hundreds of sponsors to maintain compliance and reduce risk through advanced AI automation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-[#263976] rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Intelligence</h3>
              <p className="text-gray-600">
                Advanced AI agents trained on sponsor compliance requirements with expert-level analysis capabilities
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-[#00c3ff] rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Analysis</h3>
              <p className="text-gray-600">
                Get compliance results in seconds with automated breach detection and professional reporting
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-[#263976] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Expert Support</h3>
              <p className="text-gray-600">
                Created by qualified immigration advisers with ongoing support and regular updates
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Digital Tools Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-[#263976] mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">
                Digital Sponsor Compliance Tools
              </h2>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional templates and tools for traditional compliance management
            </p>
          </div>

          {/* Featured Products */}
          {featuredProducts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Link href="/products">
              <Button size="lg" variant="outline">
                View All Digital Tools
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Sponsors Worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "The AI compliance agents saved us hours of work and provided expert-level analysis 
                that gave us complete confidence in our compliance status."
              </p>
              <div className="font-semibold">Sarah Johnson</div>
              <div className="text-sm text-gray-500">HR Director, Tech Solutions Ltd</div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Revolutionary AI technology that transforms compliance management. 
                The red flag detection caught issues we would have missed."
              </p>
              <div className="font-semibold">Michael Chen</div>
              <div className="text-sm text-gray-500">Compliance Manager, Global Corp</div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Professional quality AI agents that have completely streamlined our 
                sponsor licence compliance processes. Outstanding value."
              </p>
              <div className="font-semibold">Emma Williams</div>
              <div className="text-sm text-gray-500">Immigration Adviser</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#263976] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-[#00c3ff] mb-2">2</div>
              <div className="text-gray-300">AI Agents Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#00c3ff] mb-2">18</div>
              <div className="text-gray-300">More Agents Coming</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#00c3ff] mb-2">500+</div>
              <div className="text-gray-300">Sponsors Served</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#00c3ff] mb-2">24/7</div>
              <div className="text-gray-300">AI Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#263976] to-[#00c3ff] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Sponsor Compliance?
          </h2>
          <p className="text-xl text-gray-100 mb-8">
            Join hundreds of sponsors who trust Complians for AI-powered compliance automation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ai-agents">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                <Bot className="w-5 h-5 mr-2" />
                Try AI Agents
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-[#263976]">
                Contact Us
              </Button>
            </Link>
          </div>
          <p className="text-sm mt-6 opacity-90">
            No subscription required • One-time purchase • Lifetime access
          </p>
        </div>
      </section>
    </div>
  )
}

import VideoPlayer from '@/components/VideoPlayer'
