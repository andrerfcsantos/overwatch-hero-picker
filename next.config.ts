import type { NextConfig } from "next";

// The static export inlines NEXT_PUBLIC_* at build time, so a build without
// these would ship silently no-op analytics to production.
if (
  process.env.NODE_ENV === "production" &&
  (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ||
    !process.env.NEXT_PUBLIC_POSTHOG_HOST)
) {
  throw new Error(
    "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN and NEXT_PUBLIC_POSTHOG_HOST must be set for a production build — see .env.example.",
  );
}

// Same for Clerk, except a missing key isn't silent: ClerkProvider throws and
// takes every page down with it.
if (
  process.env.NODE_ENV === "production" &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
) {
  throw new Error(
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must be set for a production build — see .env.example.",
  );
}

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
