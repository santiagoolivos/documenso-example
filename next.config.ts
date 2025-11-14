import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
  webpack: (config) => {
    // Fix for canvas module (used by pdf.js)
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
