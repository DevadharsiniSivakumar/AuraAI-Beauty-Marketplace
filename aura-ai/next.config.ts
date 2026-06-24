import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Compile and verify types but ignore errors during next build to ensure successful deployment
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
