import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "koje24.com" },
      { protocol: "https", hostname: "koje24.vercel.app" },
      { protocol: "https", hostname: "webkoje24.vercel.app" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "*.blob.vercel-storage.com" },
      { protocol: "https", hostname: "*.vercel.app" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "**.ggpht.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },

  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    serverActions: {
      allowedOrigins: [
        "https://koje24.com",
        "https://koje24.vercel.app",
        "https://*.vercel.app",
      ],
    },
  },

  poweredByHeader: false,
  compress: true,
  trailingSlash: false,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // ✅ Basic Security Headers
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },

          // ✅ CSP: Environment-aware
          {
            key: "Content-Security-Policy",
            value: (() => {
              // 🔥 BASE CSP (shared)
              const base = [
                "default-src 'self'",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                "font-src 'self' https://fonts.gstatic.com",
                "img-src 'self' data: https: http: blob:",
                "base-uri 'self'",
                "form-action 'self'",
              ];

              // 🔥 SCRIPT-SRC (beda antara dev & production)
              let scriptSrc: string[];
              
              if (isDev) {
                // Development: longgar
                scriptSrc = [
                  "'self'",
                  "'unsafe-inline'",
                  "'unsafe-eval'", // Diperlukan untuk HMR
                  "https://*.vercel.app",
                  "https://koje24.com",
                  "https://telegram.org",
                  "https://*.telegram.org",
                  "https://www.googletagmanager.com",
                  "https://www.google-analytics.com",
                  "https://connect.facebook.net",
                  "https://cdnjs.cloudflare.com",
                  "https://*.upstash.io",
                ];
              } else {
                // Production: ketat (tanpa unsafe-eval)
                scriptSrc = [
                  "'self'",
                  // 🔥 Nonce akan di-generate di middleware/layout
                  // "'nonce-${nonce}'", // Pakai dynamic nonce
                  "https://koje24.com",
                  "https://koje24.vercel.app",
                  // 🔥 Batasi wildcard! Hanya domain yang diperlukan
                  "https://telegram.org",
                  "https://*.telegram.org",
                  "https://www.googletagmanager.com",
                  "https://www.google-analytics.com",
                  "https://connect.facebook.net",
                  "https://cdnjs.cloudflare.com",
                  "https://*.upstash.io",
                ];
              }

              // 🔥 CONNECT-SRC (beda environment)
              let connectSrc: string[];
              
              if (isDev) {
                connectSrc = [
                  "'self'",
                  "https://*.vercel.app",
                  "https://koje24.com",
                  "https://api.telegram.org",
                  "https://*.upstash.io",
                  "https://www.googleapis.com",
                  "https://*.googleapis.com",
                  "https://maps.googleapis.com",
                  "http://localhost:*",
                  "ws://localhost:*",
                ];
              } else {
                connectSrc = [
                  "'self'",
                  "https://koje24.com",
                  "https://api.telegram.org",
                  "https://*.upstash.io",
                  "https://www.googleapis.com",
                  "https://*.googleapis.com",
                  "https://maps.googleapis.com",
                ];
              }

              // 🔥 FRAME-SRC
              const frameSrc = isDev
                ? ["'self'", "https://*.vercel.app", "http://localhost:*"]
                : ["'self'", "https://*.vercel.app"];

              return [
                ...base,
                `script-src ${scriptSrc.join(" ")}`,
                `connect-src ${connectSrc.join(" ")}`,
                `frame-src ${frameSrc.join(" ")}`,
              ].join("; ");
            })(),
          },
        ],
      },

      // ✅ API Headers
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
    ];
  },

  // ✅ Redirects
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/shop",
        destination: "/#produk",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
