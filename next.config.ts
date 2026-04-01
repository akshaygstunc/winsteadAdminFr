import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  distDir: "dist",
  images: {
    unoptimized: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};


export default nextConfig;
