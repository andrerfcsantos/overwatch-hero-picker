import { initAnalytics } from "@/lib/analytics";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

// Production builds are guarded in next.config.ts; this only flags dev setups.
// It must warn, not throw: Next runs this file before hydrating, so a throw
// here leaves every page unhydrated. The keys live in .env.production, which
// `next dev` doesn't load, so a plain dev setup has no analytics by design.
if (!projectToken || !host) {
  if (process.env.NODE_ENV === "development") {
    const missingVariable = !projectToken
      ? "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN"
      : "NEXT_PUBLIC_POSTHOG_HOST";

    console.warn(
      `PostHog analytics is off: ${missingVariable} is not set. Add it to .env.local to send dev events (see .env.example).`,
    );
  }
} else {
  initAnalytics(projectToken, host);
}
