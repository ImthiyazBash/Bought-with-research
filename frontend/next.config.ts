import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    MAPBOX_TOKEN: process.env.MAPBOX_TOKEN,
  },
};

export default nextConfig;
