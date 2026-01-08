import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
  // Force Webpack instead of Turbopack
  experimental: {
    turbo: false,
  },
};

export default nextConfig;
