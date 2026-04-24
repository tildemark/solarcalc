import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import type { SolarCalculationResult } from "@/lib/calculator/types";

export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type OgImageProps = {
  params: Promise<{ shareId: string }>;
};

export default async function OpenGraphImage({ params }: OgImageProps) {
  const { shareId } = await params;

  const project = await prisma.project.findUnique({
    where: { shareId },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  const fallbackStats = ["Inverter sizing", "Battery planning", "Panel stringing"];
  const result = project?.result as SolarCalculationResult | undefined;
  const stats = result?.ogMetadata.stats?.slice(0, 3) ?? fallbackStats;
  const title = project?.name ?? "Shared Solar Build";
  const author = project?.user?.name ?? "SolarCalc User";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #0f2f1f, #1e5637 56%, #6ca35b)",
          color: "#effbe9",
          fontFamily: "Segoe UI",
          padding: 56,
          gap: 36,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 24, opacity: 0.9 }}>SolarCalc Shared Build</div>
            <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.05 }}>{title}</div>
            <div style={{ fontSize: 24, opacity: 0.9 }}>Shared by {author}</div>
          </div>
          <div style={{ display: "flex", fontSize: 22, opacity: 0.86 }}>
            solarcalc.sanchez.ph
          </div>
        </div>
        <div
          style={{
            width: 420,
            borderRadius: 24,
            border: "2px solid rgba(239, 251, 233, 0.4)",
            background: "rgba(7, 24, 13, 0.28)",
            padding: 26,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            justifyContent: "center",
          }}
        >
          {stats.map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                fontSize: 30,
                fontWeight: 700,
                borderBottom: "1px solid rgba(239, 251, 233, 0.25)",
                paddingBottom: 10,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
