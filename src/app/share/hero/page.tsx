import type { Metadata } from "next";
import SharedHeroContent from "@/components/SharedHeroContent";

const title = "Someone randomized a hero for you";
const description =
  "Open the link to reveal which Overwatch hero was randomized for you, then roll again with the same filters.";

export const metadata: Metadata = {
  title: { absolute: `${title} | Overwatch Hero Picker` },
  description,
  // Every visit is a different payload behind the same URL, so there is nothing
  // here worth indexing.
  robots: { index: false, follow: true },
  openGraph: {
    title,
    description,
    url: "https://www.owheropicker.com/share/hero",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function SharedHeroPage() {
  return <SharedHeroContent />;
}
