import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Optional: Add alias for imports
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
  // Explicitly tell Next.js to use Webpack
  experimental: {
    turbo: false,
  },
};

export default nextConfig;
