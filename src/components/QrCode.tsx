import { useMemo } from "react";
import { encode } from "uqr";

interface QrCodeProps {
  value: string;
  /** Accessible description of what scanning the code opens. */
  label: string;
  className?: string;
}

/**
 * A QR code drawn as one SVG path, so it stays sharp at any size and needs no
 * canvas or innerHTML. Dark modules on a white quiet zone, which every phone
 * camera reads regardless of the page's colours.
 */
export default function QrCode({ value, label, className }: QrCodeProps) {
  const { size, path } = useMemo(() => {
    const qr = encode(value, { ecc: "M", border: 2 });
    let d = "";
    qr.data.forEach((row, y) => {
      row.forEach((dark, x) => {
        if (dark) d += `M${x} ${y}h1v1h-1z`;
      });
    });
    return { size: qr.size, path: d };
  }, [value]);

  return (
    <svg
      className={className}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
    >
      <rect width={size} height={size} fill="#fff" />
      <path d={path} fill="#000" />
    </svg>
  );
}
