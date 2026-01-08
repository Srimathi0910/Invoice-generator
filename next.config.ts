import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
  // Disable Turbopack by default in builds
  // This is the proper way in Next 16+ 
  experimental: {
    fullySpecified: false,
  },
};

export default nextConfig;
