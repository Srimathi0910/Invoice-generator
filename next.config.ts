import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // If you have a custom webpack config, you can keep it
  webpack: (config) => {
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      path: false,
      os: false,
    };
    return config;
  },

  // Add empty turbopack config to silence warnings
  turbopack: {}, // ✅ this is valid
};

export default nextConfig;
