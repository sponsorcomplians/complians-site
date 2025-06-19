// test-worker-api.mjs
console.log('Starting worker API test...')

// Test environment variables first
console.log('Environment check:')
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT FOUND')
console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// Since Node.js doesn't automatically load .env.local, let's load it manually
import { config } from 'dotenv'
config({ path: '.env.local' })

console.log('After loading .env.local:')
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'STILL NOT FOUND')
console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

console.log('Test completed!')