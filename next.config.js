/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // During production builds, do not run ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['your-supabase-url.supabase.co'], // Add your Supabase domain if using images
  },
}

module.exports = nextConfig