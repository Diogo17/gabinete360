import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@gabinete360/ui", "@gabinete360/types"],
  reactStrictMode: true,
};

export default nextConfig;
