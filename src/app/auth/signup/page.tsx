'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Smartphone, ArrowLeft, CheckCircle, AlertCircle, User, Building, Phone, Briefcase, Users, Building2 } from 'lucide-react'

export default function EnhancedSignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'details' | 'otp' | 'success'>('details')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    companyName: '',
    phone: '',
    jobTitle: '',
    companySize: '',
    industry: '',
  })

  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  const companySize = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-1000 employees',
    '1000+ employees'
  ]

  const industries = [
    'Legal Services',
    'Immigration Law',
    'HR & Recruitment',
    'Consulting',
    'Technology',
    'Education',
    'Healthcare',
    'Finance',
    'Other'
  ]

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Send OTP
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          purpose: 'signup'
        })
      })

      const data = await response.json()

      if (data.success) {
        setOtpSent(true)
        setStep('otp')
        setSuccess('Verification code sent to your email!')
      } else {
        setError(data.message || 'Failed to send verification code')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Sign up with OTP
      const result = await signIn('otp-signup', {
        email: formData.email,
        otpCode,
        fullName: formData.fullName,
        companyName: formData.companyName,
        phone: formData.phone,
        jobTitle: formData.jobTitle,
        companySize: formData.companySize,
        industry: formData.industry,
        redirect: false
      })

      if (result?.ok) {
        setStep('success')
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setError('Invalid verification code. Please try again.')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          purpose: 'signup'
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('New verification code sent!')
      } else {
        setError(data.message || 'Failed to resend code')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-[#263976]">
            Complians
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join thousands of professionals using AI-powered compliance solutions
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${step === 'details' ? 'text-[#263976]' : step === 'otp' || step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'details' ? 'bg-[#263976] text-white' : step === 'otp' || step === 'success' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">Details</span>
          </div>
          <div className={`w-8 h-0.5 ${step === 'otp' || step === 'success' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step === 'otp' ? 'text-[#263976]' : step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'otp' ? 'bg-[#263976] text-white' : step === 'success' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">Verify</span>
          </div>
          <div className={`w-8 h-0.5 ${step === 'success' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'success' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium">Complete</span>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Details Form */}
        {step === 'details' && (
          <form className="mt-8 space-y-6" onSubmit={handleDetailsSubmit}>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#00c3ff] focus:border-[#00c3ff] focus:z-10 sm:text-sm"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#00c3ff] focus:border-[#00c3ff] focus:z-10 sm:text-sm"
                    placeholder="John Smith"
                  />
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#00c3ff] focus:border-[#00c3ff] focus:z-10 sm:text-sm"
                    placeholder="Your Company Ltd"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#00c3ff] focus:border-[#00c3ff] focus:z-10 sm:text-sm"
                    placeholder="+44 20 1234 5678"
                  />
                </div>
              </div>

              {/* Job Title */}
              <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
                  Job Title
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="jobTitle"
                    name="jobTitle"
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#00c3ff] focus:border-[#00c3ff] focus:z-10 sm:text-sm"
                    placeholder="HR Manager"
                  />
                </div>
              </div>

              {/* Company Size */}
              <div>
                <label htmlFor="companySize" className="block text-sm font-medium text-gray-700">
                  Company Size
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="companySize"
                    name="companySize"
                    value={formData.companySize}
                    onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-[#00c3ff] focus:border-[#00c3ff] focus:z-10 sm:text-sm"
                  >
                    <option value="">Select company size</option>
                    {companySize.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Industry */}
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                  Industry
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-[#00c3ff] focus:border-[#00c3ff] focus:z-10 sm:text-sm"
                  >
                    <option value="">Select industry</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#263976] hover:bg-[#1a2557] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00c3ff] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <form className="mt-8 space-y-6" onSubmit={handleOtpSubmit}>
            <div className="text-center">
              <Smartphone className="mx-auto h-12 w-12 text-[#00c3ff]" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Check your email</h3>
              <p className="mt-1 text-sm text-gray-600">
                We sent a 6-digit verification code to<br />
                <strong>{formData.email}</strong>
              </p>
            </div>

            <div>
              <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div className="mt-1">
                <input
                  id="otpCode"
                  name="otpCode"
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#00c3ff] focus:border-[#00c3ff] focus:z-10 sm:text-sm text-center text-lg tracking-widest"
                  placeholder="123456"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="flex-1 flex justify-center items-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00c3ff]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#263976] hover:bg-[#1a2557] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00c3ff] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-sm text-[#00c3ff] hover:text-[#0099cc] disabled:opacity-50"
              >
                Didn't receive the code? Resend
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Account Created Successfully!</h3>
            <p className="mt-2 text-sm text-gray-600">
              Welcome to Complians! Redirecting you to your dashboard...
            </p>
          </div>
        )}

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/signin" className="font-medium text-[#00c3ff] hover:text-[#0099cc]">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
