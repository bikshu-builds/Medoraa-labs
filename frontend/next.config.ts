import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve larger srcset widths so the hero photo stays sharp
    deviceSizes: [640, 750, 828, 1080, 1200, 1670, 1920],
    imageSizes: [64, 96, 128, 256, 384, 512],
    formats: ["image/avif", "image/webp"],
    qualities: [75, 100],
  },
};

export default nextConfig;
