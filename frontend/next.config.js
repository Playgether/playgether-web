/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
  },
  images: {
    domains: ['localhost', '127.0.0.1', '192.168.18.5', 'images.unsplash', 'images.unsplash.com'], 
  }
}

module.exports = nextConfig
