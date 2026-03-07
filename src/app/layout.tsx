import type { Metadata } from "next";
import "./globals.css";
import { HeroProvider } from "@/context/HeroContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { heroKeys } from "@/data/heroes";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.owheropicker.com"),
  title: "Overwatch Random Hero Picker | For teams and solo players",
  description:
    "Overwatch Hero Picker for teams and solo players. Get random heroes from the ones you select. Choose heroes for Quick Play, Competitive and other game modes. No ads.",
  openGraph: {
    locale: "en_US",
    type: "website",
    title: "Overwatch Random Hero Picker",
    description:
      "Overwatch Hero Picker for teams and solo players. Get random heroes from the ones you select. Choose heroes for Quick Play, Competitive and other game modes. No ads.",
    url: "https://www.owheropicker.com/",
    siteName: "Overwatch Random Hero Picker",
    images: ["/assets/imgs/heroes/icons/tracer.png"],
  },
  twitter: {
    card: "summary",
    title: "Overwatch Random Hero Picker",
    description:
      "Overwatch Hero Picker for teams and solo players. Get random heroes from the ones you select. Choose heroes for Quick Play, Competitive and other game modes. No ads.",
    images: ["/assets/imgs/heroes/icons/tracer.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload navbar images */}
        <link rel="preload" as="image" href="/assets/imgs/navbar/ow-logo.svg" />
        <link rel="preload" as="image" href="/assets/imgs/navbar/bmc.svg" />
        <link rel="preload" as="image" href="/assets/imgs/discord.png" />

        {/* Preload role icons */}
        <link rel="preload" as="image" href="/assets/imgs/roles/tank.png" />
        <link rel="preload" as="image" href="/assets/imgs/roles/damage.png" />
        <link rel="preload" as="image" href="/assets/imgs/roles/support.png" />

        {/* Preload font */}
        <link
          rel="preload"
          href="/assets/fonts/big_noodle_titling-webfont.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* Preload hero icons */}
        {heroKeys.map((key) => (
          <link
            key={`preload-icon-${key}`}
            rel="preload"
            as="image"
            href={`/assets/imgs/heroes/icons/${key}.png`}
          />
        ))}

        {/* Prefetch hero portraits (loaded on demand) */}
        {heroKeys.map((key) => (
          <link
            key={`prefetch-portrait-${key}`}
            rel="prefetch"
            as="image"
            href={`/assets/imgs/heroes/portraits/${key}.png`}
          />
        ))}
      </head>
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
