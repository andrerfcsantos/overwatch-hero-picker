import { renderShareTease, shareTeaseSize } from "@/lib/og/shareTease";

export const dynamic = "force-static";
export const alt = "Someone randomized an Overwatch squad for you";
export const size = shareTeaseSize;
export const contentType = "image/png";

export default function ShareSquadOGImage() {
  return renderShareTease({
    headline: "Someone randomized a squad for you",
    subline: "The line-up stays hidden until you open the link.",
    plates: 5,
  });
}
