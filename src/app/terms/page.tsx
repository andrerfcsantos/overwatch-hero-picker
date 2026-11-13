import type { Metadata } from "next";
import TermsOfService from "@/components/legal/TermsOfService";

const description =
  "The terms of use for the Overwatch Hero Picker, a fan-made random hero picker for Overwatch.";

export const metadata: Metadata = {
  title: "Terms of Service | Overwatch Hero Picker",
  description,
  alternates: { canonical: "https://www.owheropicker.com/terms" },
};

export default function Page() {
  return <TermsOfService />;
}
