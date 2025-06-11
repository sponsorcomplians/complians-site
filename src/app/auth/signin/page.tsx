'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Smartphone, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function EnhancedSigninPage() {
  const router = useRouter()
  const [method, setMethod] = useState<'password' | 'otp'>('password')
  const [step, setStep] = useState<'login' | 'otp' | 'success'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Form data
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.ok) {
        setStep('success')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        setError('Invalid email or password. Please try again.')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          purpose: 'login'
        })
      })

      const data = await response.json()

      if (data.success) {
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

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('otp-login', {
        email,
        otpCode,
        redirect: false
      })

      if (result?.ok) {
        setStep('success')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
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
          email,
          purpose: 'login'
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
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your AI-powered compliance dashboard
          </p>
        </div>

        {/* Method Selection */}
        {step === 'login' && (
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setMethod('password')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                method === 'password'
                  ? 'bg-white text-[#263976] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Lock className="h-4 w-4 inline mr-2" />
              Password
            </button>
            <button
              onClick={() => setMethod('otp')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                method === 'otp'
                  ? 'bg-white text-[#263976] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Smartphone className="h-4 w-4 inline mr-2" />
              Email Code
            </button>
          </div>
        )}

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

        {/* Password Login Form */}
        {step === 'login' && method === 'password' && (
          <form className="mt-8 space-y-6" onSubmit={handlePasswordLogin}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#00c3ff] focus:border-[#00c3ff] focus:z-10 sm:text-sm"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full pl-10 pr-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#00c3ff] focus:border-[#00c3ff] focus:z-10 sm:text-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#263976] hover:bg-[#1a2557] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00c3ff] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="text-center">
              <Link href="/auth/forgot-password" className="text-sm text-[#00c3ff] hover:text-[#0099cc]">
                Forgot your password?
              </Link>
            </div>
          </form>
        )}

        {/* OTP Login Form */}
        {step === 'login' && method === 'otp' && (
          <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
            <div>
              <label htmlFor="email-otp" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email-otp"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#00c3ff] focus:border-[#00c3ff] focus:z-10 sm:text-sm"
                  placeholder="your@email.com"
                />
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

        {/* OTP Verification */}
        {step === 'otp' && (
          <form className="mt-8 space-y-6" onSubmit={handleOtpLogin}>
            <div className="text-center">
              <Smartphone className="mx-auto h-12 w-12 text-[#00c3ff]" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Check your email</h3>
              <p className="mt-1 text-sm text-gray-600">
                We sent a 6-digit verification code to<br />
                <strong>{email}</strong>
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
                onClick={() => setStep('login')}
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
                {loading ? 'Verifying...' : 'Sign In'}
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

        {/* Success */}
        {step === 'success' && (
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Welcome back!</h3>
            <p className="mt-2 text-sm text-gray-600">
              Redirecting you to your dashboard...
            </p>
          </div>
        )}

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="font-medium text-[#00c3ff] hover:text-[#0099cc]">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
