/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/ws/:path*",
        destination: "http://192.168.18.8:8000/ws/:path*", // backend WS
      },
      {
        source: "/api/v1/:path*",
        destination: "http://192.168.18.8:8000/api/v1/:path*",
      },
    ];
  },
  experimental: {},
  images: {
    domains: [
      "localhost",
      "127.0.0.1",
      "192.168.18.5",
      "192.168.15.189",
      "192.168.15.255",
      "192.168.15.60",
      "images.unsplash",
      "images.unsplash.com",
      "res.cloudinary.com",
    ],
  },

  env: {
    baseUrl: process.env.LOCAL_API_URL,
  },
};

module.exports = nextConfig;
