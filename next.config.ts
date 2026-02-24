import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // React Strict Mode double-invokes effects in dev which breaks Kaplay's singleton
  reactStrictMode: false,
}

export default nextConfig
