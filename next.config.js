/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  // ⚡ Images (external URLs allow)
  images: {
    domains: ["images.unsplash.com", "i.ibb.co"],
  },

  // ⚡ Experimental (safe)
  experimental: {
    appDir: true,
  },

  // ⚡ Webpack fallback (firebase safe)
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
