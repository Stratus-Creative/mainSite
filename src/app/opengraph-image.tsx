import { ImageResponse } from "next/og";

export const alt =
  "Stratus Creative — Websites, workflows, and online presence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#181818",
          color: "#fafafa",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 18,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 32,
              height: 1,
              backgroundColor: "rgba(255,255,255,0.55)",
              marginRight: 12,
            }}
          />
          <div style={{ display: "flex" }}>
            Stratus Creative · est. 2026
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, display: "flex" }} />

        {/* Headline */}
        <div
          style={{
            fontSize: 92,
            fontWeight: 600,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color: "#fafafa",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex" }}>Websites, workflows,</div>
          <div style={{ display: "flex" }}>
            <div style={{ display: "flex", marginRight: 24 }}>and</div>
            <div style={{ display: "flex", color: "#7894e8" }}>
              online presence.
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            marginTop: 48,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          <div style={{ display: "flex" }}>
            For businesses that want to look bigger than they are.
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "ui-monospace, monospace",
              fontSize: 18,
              letterSpacing: "0.05em",
            }}
          >
            stratus-creative.com
          </div>
        </div>
      </div>
    ),
    size
  );
}
