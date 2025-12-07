import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "/uploads/**",
      },
    ],
  },
  output: "standalone", // Commented out for local development
  devIndicators: {},
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
