export interface Product {
  id: string
  title: string
  description: string
  price: number
  slug: string
  thumbnail_url?: string | null
  video_url?: string | null
  is_active: boolean
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name?: string | null
  created_at: string
}