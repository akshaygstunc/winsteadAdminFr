import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  distDir: "dist",
  images: {
    unoptimized: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};


export default nextConfig;
