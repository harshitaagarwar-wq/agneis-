import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@aegis/shared"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
