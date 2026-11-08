import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Overwatch Random Hero Picker",
    short_name: "OW Hero Picker",
    description:
      "Overwatch Hero Picker for teams and solo players. Get random heroes from the ones you select.",
    start_url: "/",
    display: "standalone",
    background_color: "#2c3e50",
    theme_color: "#f89e4a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "16x16 32x32 48x48",
        type: "image/x-icon",
      },
      {
        src: "/assets/imgs/logo/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/assets/imgs/logo/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/assets/imgs/logo/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
