import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  images: {
    // AVIF files are roughly half the size of WebP for photos, but AVIF encoding
    // is slow — in dev the first hit of every image would stall, so dev serves
    // WebP only and production gets AVIF with a WebP fallback.
    formats: isProd ? ["image/avif", "image/webp"] : ["image/webp"],
    // Tighter ladder than the default (which jumps 1920 -> 2048 -> 3840): fewer
    // variants to generate, and no 4K candidates for photos that are only
    // 2000-2200px wide to begin with.
    deviceSizes: [480, 640, 828, 1080, 1280, 1600, 1920, 2400],
    // Photos are static files that only change when a new deploy ships, so let
    // optimized copies live for a month instead of the 4h default (every expiry
    // means re-encoding the photo on the next visit).
    minimumCacheTTL: 60 * 60 * 24 * 31,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
