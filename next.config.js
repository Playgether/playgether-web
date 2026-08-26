/** @type {import('next').NextConfig} */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Baseline security headers + CSP.
 * Permissive enough for Next.js, Google OAuth, Cloudinary, and LAN API/WS;
 * still blocks the worst XSS vectors (object/base/form/framing).
 */
function buildSecurityHeaders() {
  const csp = [
    "default-src 'self'",
    [
      "script-src",
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "https://accounts.google.com",
      "https://apis.google.com",
      "https://*.gstatic.com",
      "https://upload-widget.cloudinary.com",
      "https://widget.cloudinary.com",
      "https://upload.cloudinary.com",
      "https://media-library.cloudinary.com",
    ].join(" "),
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' blob: data: https: http: wss: ws:",
    "media-src 'self' blob: https: http:",
    [
      "frame-src",
      "'self'",
      "https://accounts.google.com",
      "https://upload-widget.cloudinary.com",
      "https://widget.cloudinary.com",
      "https://media-library.cloudinary.com",
    ].join(" "),
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join("; ");

  return [
    { key: "Content-Security-Policy", value: csp },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=()",
    },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  ];
}

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

  async headers() {
    return [
      {
        source: "/:path*",
        headers: buildSecurityHeaders(),
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
        hostname: "192.168.1.15",
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
