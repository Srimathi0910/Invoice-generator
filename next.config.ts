import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Alias for imports
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
  // Disable Turbopack by explicitly providing an empty config
  turbopack: {}, 
};

export default nextConfig;
