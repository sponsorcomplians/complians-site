import React, { useState, FormEvent, ChangeEvent } from 'react'
import { supabase } from '@/lib/supabase'

interface WorkerProfileFormData {
  full_name: string
  email: string
  phone: string
  specialization: string
  experience_years: number
  hourly_rate: number
  bio: string
  availability: string
}

export function WorkerProfileForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Partial<WorkerProfileFormData>>({})
  
  const [formData, setFormData] = useState<WorkerProfileFormData>({
    full_name: '',
    email: '',
    phone: '',
    specialization: '',
    experience_years: 0,
    hourly_rate: 0,
    bio: '',
    availability: ''
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experience_years' || name === 'hourly_rate' ? Number(value) : value
    }))
    // Clear error for this field when user starts typing
    if (errors[name as keyof WorkerProfileFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<WorkerProfileFormData> = {}
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }
    
    if (!formData.specialization) {
      newErrors.specialization = 'Please select a specialization'
    }
    
    if (formData.experience_years < 0) {
      newErrors.experience_years = 'Experience cannot be negative' as any
    }
    
    if (formData.hourly_rate < 0) {
      newErrors.hourly_rate = 'Rate cannot be negative' as any
    }
    
    if (!formData.availability) {
      newErrors.availability = 'Please select availability'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setIsLoading(true)
      setMessage('')

      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Insert or update worker profile directly using Supabase
      const { error } = await supabase
        .from('worker_profiles')
        .upsert({
          user_id: user.id,
          ...formData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      setMessage('Profile updated successfully!')
      // Reset form
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        specialization: '',
        experience_years: 0,
        hourly_rate: 0,
        bio: '',
        availability: ''
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage('Error updating profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Worker Profile</h2>
      
      {message && (
        <div className={`p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
          {message}
        </div>
      )}

      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      <div>
        <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
          Specialization
        </label>
        <select
          id="specialization"
          name="specialization"
          value={formData.specialization}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select a specialization</option>
          <option value="plumbing">Plumbing</option>
          <option value="electrical">Electrical</option>
          <option value="carpentry">Carpentry</option>
          <option value="painting">Painting</option>
          <option value="hvac">HVAC</option>
          <option value="landscaping">Landscaping</option>
          <option value="general">General Maintenance</option>
        </select>
        {errors.specialization && (
          <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>
        )}
      </div>

      <div>
        <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700">
          Years of Experience
        </label>
        <input
          type="number"
          id="experience_years"
          name="experience_years"
          value={formData.experience_years}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.experience_years && (
          <p className="mt-1 text-sm text-red-600">{errors.experience_years}</p>
        )}
      </div>

      <div>
        <label htmlFor="hourly_rate" className="block text-sm font-medium text-gray-700">
          Hourly Rate ($)
        </label>
        <input
          type="number"
          step="0.01"
          id="hourly_rate"
          name="hourly_rate"
          value={formData.hourly_rate}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.hourly_rate && (
          <p className="mt-1 text-sm text-red-600">{errors.hourly_rate}</p>
        )}
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Tell us about yourself and your experience..."
        />
      </div>

      <div>
        <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
          Availability
        </label>
        <select
          id="availability"
          name="availability"
          value={formData.availability}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select availability</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="weekends">Weekends only</option>
          <option value="evenings">Evenings only</option>
          <option value="on-call">On-call</option>
        </select>
        {errors.availability && (
          <p className="mt-1 text-sm text-red-600">{errors.availability}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
      >
        {isLoading ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  )
}