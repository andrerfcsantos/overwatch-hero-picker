import {
  spritePositions,
  ICON_SPRITE,
  PORTRAIT_SPRITE,
} from "@/data/spriteMap";

type SpriteConfig = typeof ICON_SPRITE | typeof PORTRAIT_SPRITE;

interface SpriteIconProps {
  heroKey: string;
  type: "icon" | "portrait";
  className?: string;
  alt: string;
  ref?: React.Ref<HTMLDivElement>;
}

function getSpriteStyle(sprite: SpriteConfig, col: number, row: number) {
  const bgPctX =
    sprite.columns <= 1 ? 0 : (col / (sprite.columns - 1)) * 100;
  const bgPctY = sprite.rows <= 1 ? 0 : (row / (sprite.rows - 1)) * 100;

  return {
    backgroundImage: `url(${sprite.src})`,
    backgroundPosition: `${bgPctX}% ${bgPctY}%`,
    backgroundSize: `${sprite.columns * 100}% auto`,
    backgroundRepeat: "no-repeat",
  } as const;
}

export default function SpriteIcon({
  heroKey,
  type,
  className,
  alt,
  ref,
}: SpriteIconProps) {
  const sprite = type === "icon" ? ICON_SPRITE : PORTRAIT_SPRITE;
  const pos = spritePositions[heroKey];
  if (!pos) return null;

  return (
    <div
      ref={ref}
      role="img"
      aria-label={alt}
      className={className}
      style={getSpriteStyle(sprite, pos.col, pos.row)}
    />
  );
}
