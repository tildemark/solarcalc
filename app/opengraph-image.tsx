import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(125deg, #103321, #2e6a43 58%, #88ba63)",
          color: "#eefbe9",
          fontFamily: "Segoe UI",
          padding: 58,
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 760 }}>
          <div style={{ fontSize: 26, opacity: 0.92 }}>SolarCalc</div>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.06 }}>
            Design Accurate Solar Builds
          </div>
          <div style={{ fontSize: 30, opacity: 0.92 }}>
            Inverter sizing, battery design, panel stringing, and share-ready outputs.
          </div>
        </div>
        <div
          style={{
            width: 250,
            height: 250,
            borderRadius: 26,
            border: "2px solid rgba(238, 251, 233, 0.55)",
            background: "rgba(6, 20, 10, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 68,
            fontWeight: 800,
          }}
        >
          SUN
        </div>
      </div>
    ),
    size,
  );
}
