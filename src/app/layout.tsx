import type { Metadata } from "next";
import "./globals.css";
import { HeroProvider } from "@/context/HeroContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Overwatch Random Hero Picker | For teams and solo players",
  description:
    "Overwatch Hero Picker for teams and solo players. Select the heroes you want to play and get a random hero from the selection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <HeroProvider>
          <Navbar />
          {children}
          <Footer />
        </HeroProvider>
      </body>
    </html>
  );
}
