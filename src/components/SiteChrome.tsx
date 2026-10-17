"use client";

import { usePathname } from "next/navigation";
import { HeroProvider } from "@/context/HeroContext";
import { PresetProvider } from "@/context/PresetContext";
import { OVERLAY_PATH } from "@/lib/overlay";

interface SiteChromeProps {
  children: React.ReactNode;
  /** Passed in from the layout so they can stay server components. */
  navbar: React.ReactNode;
  footer: React.ReactNode;
  extras?: React.ReactNode;
}

/**
 * Wraps every page in the site's providers, navbar and footer — except the
 * stream overlay, which is captured into a video and must be nothing but the
 * hero card on a transparent background. Skipping the providers there matters
 * too: the hero provider applies `?d=` links to the picker's saved selection,
 * and the overlay's link must not touch it.
 *
 * The overlay is only ever opened directly (in OBS), never reached through
 * client-side navigation, so the tree never switches shape mid-session.
 */
export default function SiteChrome({
  children,
  navbar,
  footer,
  extras,
}: SiteChromeProps) {
  const pathname = usePathname();
  if (pathname === OVERLAY_PATH || pathname.startsWith(`${OVERLAY_PATH}/`)) {
    return <>{children}</>;
  }

  return (
    <HeroProvider>
      <PresetProvider>
        {navbar}
        {children}
        {footer}
        {extras}
      </PresetProvider>
    </HeroProvider>
  );
}
