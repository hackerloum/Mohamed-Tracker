import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  additionalPrecacheEntries: [{ url: "/offline", revision: "wave-a-1" }],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
};

export default withSerwist(nextConfig);
