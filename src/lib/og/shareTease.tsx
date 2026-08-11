import { ImageResponse } from "next/og";

export const shareTeaseSize = { width: 1200, height: 630 };

interface ShareTeaseOptions {
  headline: string;
  subline: string;
  /** How many mystery plates to draw: one for a hero, a row for a squad. */
  plates: number;
}

function Plate({ width, height }: { width: number; height: number }) {
  return (
    <div
      style={{
        display: "flex",
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: "12px",
        backgroundColor: "#1a2332",
        border: "2px solid rgba(248, 158, 74, 0.35)",
        alignItems: "center",
        justifyContent: "center",
        fontSize: `${Math.round(height * 0.45)}px`,
        fontWeight: "bold",
        color: "rgba(248, 158, 74, 0.75)",
      }}
    >
      ?
    </div>
  );
}

/**
 * Link preview for the share pages. The whole point of a share link is that the
 * hero stays hidden until it is opened, so the card teases rather than reveals.
 */
export function renderShareTease({
  headline,
  subline,
  plates,
}: ShareTeaseOptions) {
  const plateWidth = plates === 1 ? 240 : 84;
  const plateHeight = plates === 1 ? 380 : 130;
  const plateGap = 12;
  // Keep the plate row inside the 1200px card: 60px padding on either side.
  const textWidth =
    1200 - 120 - (plates * plateWidth + (plates - 1) * plateGap) - 40;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#2c3e50",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "8px",
          backgroundColor: "#f89e4a",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flex: 1,
          padding: "0 60px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: `${textWidth}px`,
          }}
        >
          <div
            style={{
              fontSize: "22px",
              color: "#7f8c8d",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            Overwatch Hero Picker
          </div>
          <div
            style={{
              fontSize: "54px",
              fontWeight: "bold",
              color: "#f89e4a",
              textTransform: "uppercase",
              lineHeight: 1.1,
              marginTop: "14px",
            }}
          >
            {headline}
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#bdc3c7",
              marginTop: "18px",
              lineHeight: 1.5,
            }}
          >
            {subline}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "28px",
              backgroundColor: "#f89e4a",
              borderRadius: "28px",
              padding: "10px 28px",
              fontSize: "20px",
              fontWeight: "bold",
              color: "#ffffff",
            }}
          >
            Open to reveal →
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: `${plateGap}px`,
            marginLeft: "auto",
            alignItems: "center",
          }}
        >
          {Array.from({ length: plates }, (_, i) => (
            <Plate key={i} width={plateWidth} height={plateHeight} />
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "0 60px 24px",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "1px",
            backgroundColor: "#7f8c8d",
            marginBottom: "14px",
          }}
        />
        <div style={{ fontSize: "18px", color: "#7f8c8d" }}>
          owheropicker.com
        </div>
      </div>
    </div>,
    { ...shareTeaseSize },
  );
}
