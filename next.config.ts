import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only: allow the LAN IP(s) you open the app from (e.g. testing on a phone)
  // to load Next's /_next dev resources (CSS chunks, HMR, JS). Without this,
  // Next 16 blocks cross-origin dev requests → unstyled pages + client runtime
  // errors. localhost/127.0.0.1 are always allowed; add other hosts here.
  // Wildcards cover ngrok tunnels (random free domains end in .ngrok-free.app /
  // .ngrok-free.dev; paid/static end in .ngrok.app) so we don't have to edit
  // this every time the tunnel URL changes.
  allowedDevOrigins: [
    "192.168.0.153",
    "*.trycloudflare.com",
    "*.ngrok-free.app",
    "*.ngrok-free.dev",
    "*.ngrok.app",
    "*.ngrok.io",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    // Prefer AVIF (smaller, sharper) with WebP fallback. Browsers without
    // either still get the original.
    formats: ["image/avif", "image/webp"],
    // Allow callers to pass quality up to 95 on Image; default stays 75.
    qualities: [60, 75, 85, 90, 95],
  },
};

export default nextConfig;
