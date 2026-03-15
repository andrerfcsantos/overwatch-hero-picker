import type { Metadata } from "next";
import SquadContent from "@/components/SquadContent";

export const metadata: Metadata = {
  title: "Squad Generator | Overwatch Hero Picker",
  description:
    "Generate random Overwatch team compositions. Build squads with balanced roles for Quick Play, Competitive, and custom game modes.",
  openGraph: {
    title: "Squad Generator | Overwatch Hero Picker",
    description:
      "Generate random Overwatch team compositions. Build squads with balanced roles for Quick Play, Competitive, and custom game modes.",
    url: "https://www.owheropicker.com/squad",
  },
  twitter: {
    card: "summary_large_image",
    title: "Squad Generator | Overwatch Hero Picker",
    description:
      "Generate random Overwatch team compositions. Build squads with balanced roles for Quick Play, Competitive, and custom game modes.",
  },
};

export default function SquadPage() {
  return <SquadContent />;
}
