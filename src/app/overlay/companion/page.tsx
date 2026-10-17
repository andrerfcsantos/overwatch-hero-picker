import type { Metadata, Viewport } from "next";
import CompanionContent from "@/components/CompanionContent";

export const metadata: Metadata = {
  title: { absolute: "Stream companion | Overwatch Hero Picker" },
  description:
    "See the hero your stream overlay just rolled, live, on your phone or a second screen.",
  // Every link is a private room.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0f1923",
};

export default function CompanionPage() {
  return <CompanionContent />;
}
