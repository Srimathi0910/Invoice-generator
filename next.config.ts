import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Ignore .map files in node_modules/chrome-aws-lambda
    config.module.rules.push({
      test: /\.js\.map$/,
      loader: "ignore-loader",
    });

    return config;
  },

  // Keep turbopack config empty if needed
  turbopack: {},
};

export default nextConfig;
