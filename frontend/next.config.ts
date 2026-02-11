import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProd ? process.env.NEXT_PUBLIC_BASE_PATH || '' : '',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    MAPBOX_TOKEN: process.env.MAPBOX_TOKEN,
  },
};

export default nextConfig;
