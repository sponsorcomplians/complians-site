/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'ounxkplozusdysevpjan.supabase.co', // Add this line
      // ... any other domains you might have
    ],
  },
};

module.exports = nextConfig;
