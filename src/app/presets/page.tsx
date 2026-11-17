import type { Metadata } from "next";
import PresetsPage from "@/components/PresetsPage";

export const metadata: Metadata = {
  title: { absolute: "Manage Presets | Overwatch Hero Picker" },
  description:
    "Rename, reorder and remove the hero filter presets saved on this device.",
  // Presets live in the visitor's own browser, so there is nothing here worth
  // indexing.
  robots: { index: false, follow: true },
};

export default function Page() {
  return <PresetsPage />;
}
