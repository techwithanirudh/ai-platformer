import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Strict Mode double-invokes effects in dev which breaks Kaplay's singleton
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
