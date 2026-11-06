import { ROLE_SPRITE, roleSpritePositions } from "@/data/spriteMap";

interface RoleSpriteIconProps {
  roleKey: string;
  className?: string;
  alt: string;
}

export default function RoleSpriteIcon({
  roleKey,
  className,
  alt,
}: RoleSpriteIconProps) {
  const pos = roleSpritePositions[roleKey.toLowerCase()];
  if (!pos) return null;

  const bgPctX =
    ROLE_SPRITE.columns <= 1 ? 0 : (pos.col / (ROLE_SPRITE.columns - 1)) * 100;

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a slice of a sprite sheet, which <img> cannot show
      role="img"
      aria-label={alt}
      className={className}
      style={{
        backgroundImage: `url(${ROLE_SPRITE.src})`,
        backgroundPosition: `${bgPctX}% 0%`,
        backgroundSize: `${ROLE_SPRITE.columns * 100}% 100%`,
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}
