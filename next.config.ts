import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  serverExternalPackages: [
    "ffmpeg-static",
    "ffprobe-static",
  ],

  outputFileTracingIncludes: {
    "/api/mlm/merge": [
      "./node_modules/ffmpeg-static/**",
      "./node_modules/ffprobe-static/**",
    ],
  },
};

export default nextConfig;
