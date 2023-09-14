/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    loader: 'custom',
    loaderFile: './supabase-image-loader.ts',
  }
}

module.exports = nextConfig
