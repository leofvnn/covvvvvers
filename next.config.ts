import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  // The share images read these font files at runtime.
  outputFileTracingIncludes: {
    "/**": ["./assets/fonts/**"],
  },
};

export default nextConfig;
