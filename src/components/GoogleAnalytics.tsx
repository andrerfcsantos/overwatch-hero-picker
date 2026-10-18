import Script from "next/script";

const MEASUREMENT_ID = "G-JLMCGX0Z78";

/**
 * Google Analytics (gtag). Rendered by SiteChrome on regular pages only: its
 * automatic page view sends the full page URL, and the overlay and companion
 * links carry room keys that must not leave the browser. PostHog redacts them
 * in `before_send`; gtag has no equivalent hook, so it is simply not loaded
 * there.
 */
export default function GoogleAnalytics() {
  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
