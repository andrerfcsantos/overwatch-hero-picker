import type { Metadata } from "next";
import AboutContent from "@/components/AboutContent";
import AboutRefresh from "@/components/refresh/AboutRefresh";

export const metadata: Metadata = {
  title: "About | Overwatch Hero Picker",
  description:
    "Learn about the Overwatch Random Hero Picker, a fan-made tool to help you decide which hero to play.",
  openGraph: {
    title: "About | Overwatch Hero Picker",
    description:
      "Learn about the Overwatch Random Hero Picker, a fan-made tool to help you decide which hero to play.",
    url: "https://www.owheropicker.com/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About | Overwatch Hero Picker",
    description:
      "Learn about the Overwatch Random Hero Picker, a fan-made tool to help you decide which hero to play.",
  },
};

/**
 * A static page of text, so it stays a server component and ships both
 * designs in its HTML. CSS shows the visitor's, which means the page is right
 * before React has loaded and its text is there for anything that reads the
 * HTML without running it.
 */
export default function AboutPage() {
  return (
    <>
      <AboutContent />
      <AboutRefresh />
    </>
  );
}
