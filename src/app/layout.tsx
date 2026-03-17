import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { HeroProvider } from "@/context/HeroContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import KeyboardShortcutHint from "@/components/KeyboardShortcutHint";
import { ICON_SPRITE, PORTRAIT_SPRITE } from "@/data/spriteMap";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.owheropicker.com"),
  title: "Overwatch Random Hero Picker | For teams and solo players",
  description:
    "Overwatch Hero Picker for teams and solo players. Get random heroes from the ones you select. Choose heroes for Quick Play, Competitive and other game modes.",
  openGraph: {
    locale: "en_US",
    type: "website",
    title: "Overwatch Random Hero Picker",
    description:
      "Overwatch Hero Picker for teams and solo players. Get random heroes from the ones you select. Choose heroes for Quick Play, Competitive and other game modes.",
    url: "https://www.owheropicker.com/",
    siteName: "Overwatch Random Hero Picker",
  },
  twitter: {
    card: "summary_large_image",
    title: "Overwatch Random Hero Picker",
    description:
      "Overwatch Hero Picker for teams and solo players. Get random heroes from the ones you select. Choose heroes for Quick Play, Competitive and other game modes.",
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
        <link rel="preload" as="image" href="/assets/imgs/discord.webp" />

        {/* Preload role icons */}
        <link rel="preload" as="image" href="/assets/imgs/roles/tank.webp" />
        <link rel="preload" as="image" href="/assets/imgs/roles/damage.webp" />
        <link rel="preload" as="image" href="/assets/imgs/roles/support.webp" />

        {/* Preload font */}
        <link
          rel="preload"
          href="/assets/fonts/big_noodle_titling-webfont.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* Preload hero sprite sheets */}
        <link rel="preload" as="image" href={ICON_SPRITE.src} />
        <link rel="prefetch" as="image" href={PORTRAIT_SPRITE.src} />

        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4006903176175824"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        ></Script>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-JLMCGX0Z78"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-JLMCGX0Z78');
          `}
        </Script>
      </head>
      <body>
        <HeroProvider>
          <Navbar />
          {children}
          <Footer />
          <KeyboardShortcutHint />
        </HeroProvider>
      </body>
    </html>
  );
}
