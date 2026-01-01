import { withContentCollections } from "@content-collections/next";
import withPWAInit from "@ducanh2912/next-pwa";

const derivedUrl =
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  (process.env.RAILWAY_PUBLIC_DOMAIN &&
    `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`) ||
  process.env.RENDER_EXTERNAL_URL ||
  process.env.COOLIFY_URL ||
  `http://localhost:${process.env.PORT ?? 3000}`;

const serverUrl = process.env.SERVER_URL || derivedUrl;

if (process.env.NODE_ENV === "production") {
  console.log("Derived server URL → ", derivedUrl);
  console.log("SERVER_URL → ", serverUrl);
}

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  sw: "sw.js",
  swSrc: "worker/index.js", // Use custom service worker source with push notification support
  cacheOnNavigation: true,
  reloadOnOnline: true,
  fallbacks: {
    document: "/offline",
  },
});

/** @type {import("next").NextConfig} */
const config = {
  output: "standalone",
  experimental: {
    viewTransition: true,
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/",
        permanent: true,
      },
      {
        source: "/items",
        destination: "/",
        permanent: true,
      },
    ];
  },

  env: {
    // pass url here so it's usable on the client and backend
    NEXT_PUBLIC_APP_URL: serverUrl,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

// Apply wrappers with explicit images config preservation
const wrappedConfig = withContentCollections(config);
const finalConfig = withPWA(wrappedConfig);

// Explicitly preserve images config (PWA wrapper can override it)
finalConfig.images = config.images;

// Explicitly preserve experimental config (wrappers might override it)
finalConfig.experimental = {
  ...finalConfig.experimental,
  ...config.experimental,
};

export default finalConfig;
