/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable static generation for pages that use authentication
  async generateStaticParams() {
    return [];
  },
  // Force all pages to be dynamic
  staticPageGenerationTimeout: 0,
}

module.exports = nextConfig
