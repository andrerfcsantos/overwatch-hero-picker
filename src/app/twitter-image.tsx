import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const dynamic = "force-static";
export const alt = "Overwatch Random Hero Picker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const heroKeys = [
  "ana",
  "anran",
  "ashe",
  "baptiste",
  "bastion",
  "brigitte",
  "cassidy",
  "domina",
  "doomfist",
  "dva",
  "echo",
  "emre",
  "freja",
  "genji",
  "hanzo",
  "hazard",
  "illari",
  "jetpackcat",
  "junkerqueen",
  "junkrat",
  "juno",
  "kiriko",
  "lifeweaver",
  "lucio",
  "mauga",
  "mei",
  "mercy",
  "mizuki",
  "moira",
  "orisa",
  "pharah",
  "ramattra",
  "reaper",
  "reinhardt",
  "roadhog",
  "sigma",
  "sojourn",
  "soldier76",
  "sombra",
  "symmetra",
  "torbjorn",
  "tracer",
  "vendetta",
  "venture",
  "widowmaker",
  "winston",
  "wreckingball",
  "wuyang",
  "zarya",
  "zenyatta",
];

function getHeroIconDataUrls(): string[] {
  const iconsDir = path.join(
    process.cwd(),
    "public/assets/imgs/heroes/icons",
  );
  return heroKeys.map((key) => {
    const buf = fs.readFileSync(path.join(iconsDir, `${key}.png`));
    return `data:image/png;base64,${buf.toString("base64")}`;
  });
}

export default function TwitterImage() {
  const iconUrls = getHeroIconDataUrls();
  const iconSize = 48;
  const iconGap = 4;
  const cols = 10;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#2c3e50",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Orange accent bar */}
        <div
          style={{
            width: "100%",
            height: "8px",
            backgroundColor: "#f89e4a",
          }}
        />

        {/* Main content row */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flex: 1,
            padding: "0 60px",
            alignItems: "center",
          }}
        >
          {/* Left side - text */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              width: "520px",
              gap: "6px",
            }}
          >
            <div
              style={{
                fontSize: "60px",
                fontWeight: "bold",
                color: "#f89e4a",
                textTransform: "uppercase",
                lineHeight: 1.1,
              }}
            >
              Overwatch
            </div>
            <div
              style={{
                fontSize: "40px",
                fontWeight: "bold",
                color: "#ffffff",
                textTransform: "uppercase",
                lineHeight: 1.2,
              }}
            >
              Random Hero Picker
            </div>
            <div
              style={{
                fontSize: "20px",
                color: "#bdc3c7",
                marginTop: "12px",
                lineHeight: 1.5,
              }}
            >
              Get a random hero for you.
            </div>
            <div
              style={{
                fontSize: "20px",
                color: "#bdc3c7",
                lineHeight: 1.5,
              }}
            >
              Randomize a team of heroes for your squad.
            </div>

            {/* CTA button */}
            <div
              style={{
                display: "flex",
                marginTop: "20px",
                backgroundColor: "#f89e4a",
                borderRadius: "28px",
                padding: "10px 28px",
                fontSize: "20px",
                fontWeight: "bold",
                color: "#ffffff",
              }}
            >
              Try it now →
            </div>
          </div>

          {/* Right side - hero icons grid */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              width: `${cols * (iconSize + iconGap)}px`,
              height: "100%",
              gap: `${iconGap}px`,
              marginLeft: "auto",
              alignContent: "center",
            }}
          >
            {iconUrls.map((src, i) => (
              <img
                key={i}
                src={src}
                width={iconSize}
                height={iconSize}
                style={{
                  borderRadius: "6px",
                  objectFit: "cover",
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom bar */}
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
          <div
            style={{
              fontSize: "18px",
              color: "#7f8c8d",
            }}
          >
            owheropicker.com
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
