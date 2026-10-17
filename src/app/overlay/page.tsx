import type { Metadata } from "next";
import OverlayContent from "@/components/OverlayContent";

export const metadata: Metadata = {
  title: { absolute: "Stream overlay | Overwatch Hero Picker" },
  description:
    "A transparent overlay that shows your random Overwatch hero on stream. Add it to OBS as a Browser Source.",
  // Only useful inside OBS, and every link carries its own filters.
  robots: { index: false, follow: false },
};

export default function OverlayPage() {
  return <OverlayContent />;
}
