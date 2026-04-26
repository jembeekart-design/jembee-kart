/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  // ⚡ Images
  images: {
    domains: ["images.unsplash.com", "i.ibb.co"],
  },

  // ❌ experimental हटाओ (appDir अब default है)

  // ⚡ Firebase safe fallback
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;
