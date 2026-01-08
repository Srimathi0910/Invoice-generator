import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
  // Force Webpack for builds
  turbopack: {}, // empty object disables Turbopack for this project
};

export default nextConfig;
