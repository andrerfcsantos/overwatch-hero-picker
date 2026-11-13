import type { Metadata } from "next";
import PrivacyPolicy from "@/components/legal/PrivacyPolicy";

const description =
  "How the Overwatch Hero Picker handles your personal data: analytics, accounts, payments and your rights.";

export const metadata: Metadata = {
  title: "Privacy Policy | Overwatch Hero Picker",
  description,
  alternates: { canonical: "https://www.owheropicker.com/privacy" },
};

export default function Page() {
  return <PrivacyPolicy />;
}
