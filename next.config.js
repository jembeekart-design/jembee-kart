/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ Production optimizations
  compress: true,
  poweredByHeader: false,

  // ✅ Images (CDN ready)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // ✅ Experimental (safe only)
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  // ✅ Webpack tweak (Termux safe)
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
    };
    return config;
  },

  // ✅ Headers (security 🔐)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // ✅ Redirect example (future use)
  async redirects() {
    return [];
  },
};

module.exports = nextConfig;
