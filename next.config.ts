import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Add '@' alias pointing to the root of your project
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
  experimental: {
    turbo: false,
  },
};

export default nextConfig;
