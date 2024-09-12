/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
  },
  images: {
    domains: ['localhost', '127.0.0.1', '192.168.18.5', "192.168.15.189", "192.168.15.255",'images.unsplash', 'images.unsplash.com'], 
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://americas.api.riotgames.com/:path*',
      },
    ];
  },
  env: {
    baseUrl: process.env.LOCAL_API_URL
  },
}

module.exports = nextConfig
