import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Overwatch Random Hero Picker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#2c3e50",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              color: "#f89e4a",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            Overwatch
          </div>
          <div
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "#ffffff",
              textAlign: "center",
            }}
          >
            Random Hero Picker
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#bdc3c7",
              textAlign: "center",
              marginTop: "16px",
            }}
          >
            Pick random heroes for solo play and team compositions
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            fontSize: "20px",
            color: "#7f8c8d",
          }}
        >
          owheropicker.com
        </div>
      </div>
    ),
    { ...size },
  );
}
