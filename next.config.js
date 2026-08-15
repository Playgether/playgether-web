/** @type {import('next').NextConfig} */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const nextConfig = {
  // Avoid redirect loops with Django APPEND_SLASH on proxied API routes.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${API_URL}/api/v1/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // backend (Django / Fly.io)
      {
        protocol: "https",
        hostname: "playgether-api.fly.dev",
      },

      // backend (Django / Railway)
      {
        protocol: "https",
        hostname: "playgether-api-production.up.railway.app",
      },

      // frontend (Vercel preview / prod)
      {
        protocol: "https",
        hostname: "*.vercel.app",
      },

      // local dev
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      {
        protocol: "http",
        hostname: "192.168.18.5",
      },
      {
        protocol: "http",
        hostname: "192.168.18.8",
      },
      {
        protocol: "http",
        hostname: "192.168.15.189",
      },
      {
        protocol: "http",
        hostname: "192.168.1.8",
      },
      {
        protocol: "http",
        hostname: "192.168.15.60",
      },
    ],
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },

  // Cold `next dev` on Windows can take 10–30s to compile layout/feed chunks;
  // the default webpack chunk timeout surfaces as ChunkLoadError and a half-hydrated UI.
  webpack: (config, { dev }) => {
    if (dev) {
      config.output = {
        ...config.output,
        chunkLoadTimeout: 300000,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
