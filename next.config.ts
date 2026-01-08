import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add this to silence Turbopack vs Webpack issues
  turbopack: {},
};

export default nextConfig;
