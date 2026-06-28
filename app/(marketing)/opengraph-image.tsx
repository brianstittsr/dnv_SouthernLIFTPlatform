import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "KDM & Associates — MBDA Federal Procurement Center";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f172a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "#f5a800",
          }}
        />

        {/* Badge */}
        <div
          style={{
            background: "#f5a800",
            color: "#0f172a",
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: 3,
            textTransform: "uppercase",
            padding: "8px 24px",
            borderRadius: 100,
            marginBottom: 32,
          }}
        >
          MBDA Federal Procurement Center
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.1,
            maxWidth: 900,
            marginBottom: 20,
          }}
        >
          KDM &amp; Associates
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Helping Diverse Businesses Win Government Contracts
        </div>

        {/* Service pills */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 48,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {["8(a) Certification", "CMMC Compliance", "HUBZone", "Federal Teaming", "KDM Consortium"].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#e2e8f0",
                  fontSize: 16,
                  padding: "8px 20px",
                  borderRadius: 100,
                }}
              >
                {tag}
              </div>
            )
          )}
        </div>

        {/* URL watermark */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            color: "#475569",
            fontSize: 18,
          }}
        >
          kdm-assoc.com
        </div>
      </div>
    ),
    { ...size }
  );
}
