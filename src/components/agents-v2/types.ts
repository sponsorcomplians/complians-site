export interface AIAgent {
  id: string
  name: string
  description: string
  icon: string
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