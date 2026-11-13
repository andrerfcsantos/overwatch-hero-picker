import type { LegalSite } from "@/components/legal/types";

/**
 * The per-site half of the Privacy Policy and Terms of Service. The documents
 * themselves (src/components/legal) are shared word for word with the
 * Valorant Agent Picker; only this file differs between the two repos.
 */
export const legalSite: LegalSite = {
  name: "Overwatch Hero Picker",
  url: "https://www.owheropicker.com",
  domain: "owheropicker.com",
  game: "Overwatch",
  publisher: "Blizzard Entertainment, Inc.",
  publisherNotice:
    "Overwatch is a trademark or registered trademark of Blizzard Entertainment, Inc. in the U.S. and/or other countries. The Overwatch Hero Picker is a fan-made site and is not affiliated with, endorsed or sponsored by Blizzard Entertainment.",
  usesPostHog: true,
  googleAnalyticsNote: "on every page except the stream overlay pages",
  hasStreamOverlay: true,
  styles: {
    heading: "text-[rgb(248,158,74)]",
    body: "[font-family:Config,Arial,Helvetica,sans-serif]",
    link: "",
  },
};
