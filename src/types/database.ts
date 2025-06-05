// Database types for the Digital Compliance Products Website

export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  slug: string
  title: string
  description?: string
  price: number
  stripe_price_id?: string
  is_active: boolean
  file_path?: string
  video_url?: string
  thumbnail_url?: string
  created_at: string
  updated_at: string
}

export interface Purchase {
  id: string
  user_id: string
  product_id: string
  stripe_payment_intent_id?: string
  stripe_session_id?: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  created_at: string
  updated_at: string
}

export interface DownloadLog {
  id: string
  user_id: string
  product_id: string
  purchase_id: string
  file_path: string
  ip_address?: string
  user_agent?: string
  downloaded_at: string
}

// Extended types for joined queries
export interface ProductWithPurchase extends Product {
  purchase_date?: string
  purchase_status?: Purchase['status']
}

export interface PurchaseWithProduct extends Purchase {
  product: Product
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Stripe types
export interface StripeCheckoutSession {
  sessionId: string
  url: string
}

// Auth types
export interface AuthUser {
  id: string
  email: string
  profile?: Profile
}

