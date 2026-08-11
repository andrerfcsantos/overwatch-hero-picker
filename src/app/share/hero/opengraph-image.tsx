import { renderShareTease, shareTeaseSize } from "@/lib/og/shareTease";

export const dynamic = "force-static";
export const alt = "Someone randomized an Overwatch hero for you";
export const size = shareTeaseSize;
export const contentType = "image/png";

export default function ShareHeroOGImage() {
  return renderShareTease({
    headline: "Someone randomized a hero for you",
    subline: "The pick stays hidden until you open the link.",
    plates: 1,
  });
}
