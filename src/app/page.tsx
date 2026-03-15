import type { Metadata } from "next";
import PickerContent from "@/components/PickerContent";

export const metadata: Metadata = {
  title: { absolute: "Overwatch Hero Picker" },
  description:
    "Pick a random Overwatch hero for you and for your squad. Select the heroes and roles you want to play, and let the picker choose a hero for you!",
  openGraph: {
    title: "Overwatch Hero Picker",
    description:
      "Pick a random Overwatch hero for you and for your squad. Select the heroes and roles you want to play, and let the picker choose a hero for you!",
    url: "https://www.owheropicker.com/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Overwatch Hero Picker",
    description:
      "Pick a random Overwatch hero for you and for your squad. Select the heroes and roles you want to play, and let the picker choose a hero for you!",
  },
};

export default function PickerPage() {
  return <PickerContent />;
}
