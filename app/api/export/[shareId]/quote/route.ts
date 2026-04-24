import { NextResponse } from "next/server";
import { getBuildExpiryCutoff } from "@/lib/build-retention";
import { prisma } from "@/lib/prisma";
import type { SolarCalculationResult, SolarInputPayload } from "@/lib/calculator/types";

type Params = {
  params: Promise<{ shareId: string }>;
};

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildQuoteHtml(projectName: string, input: SolarInputPayload, result: SolarCalculationResult): string {
  const createdAt = new Date().toLocaleString();
  const rowsMarkup = result.bom.items
    .map((item, index) => {
      const specs = item.specs
        ? Object.entries(item.specs)
            .map(([k, v]) => `${k}: ${String(v)}`)
            .join(" | ")
        : "-";

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(item.category)}</td>
          <td>${escapeHtml(item.sku)}</td>
          <td>${escapeHtml(item.description)}</td>
          <td>${item.quantity}</td>
          <td>${escapeHtml(specs)}</td>
        </tr>
      `;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(projectName)} Quote</title>
    <style>
      :root { --ink:#11251b; --muted:#4a5e54; --line:#d4ddd4; --soft:#f4f8f3; }
      * { box-sizing: border-box; }
      body { margin: 0; font-family: "Segoe UI", Tahoma, sans-serif; color: var(--ink); }
      .page { max-width: 980px; margin: 0 auto; padding: 34px; }
      .header { padding: 18px 20px; border: 1px solid var(--line); border-radius: 14px; background: linear-gradient(120deg,#0f2d20,#2e6a43 64%,#6ea45a); color:#eef8ef; }
      .header h1 { margin: 0; font-size: 30px; }
      .header p { margin: 8px 0 0; color: rgba(238,248,239,0.92); }
      h2 { margin: 20px 0 10px; font-size: 15px; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); }
      .metrics { display:grid; gap:10px; grid-template-columns:repeat(3,minmax(0,1fr)); }
      .requirements-grid { display:grid; gap:10px; grid-template-columns:repeat(2,minmax(0,1fr)); }
      .metric { border: 1px solid var(--line); border-radius: 10px; background: var(--soft); padding: 10px; }
      .metric h3 { margin: 0; font-size: 11px; color: var(--muted); text-transform: uppercase; }
      .metric p { margin: 8px 0 0; font-size: 14px; font-weight: 700; }
      table { width:100%; border-collapse: collapse; border:1px solid var(--line); }
      thead th { text-align:left; background:#edf4ee; font-size:12px; padding:10px; border-bottom:1px solid var(--line); }
      tbody td { font-size:12px; padding:10px; border-bottom:1px solid #e6ece6; vertical-align:top; }
      .note { margin-top: 12px; border:1px solid var(--line); border-radius: 10px; background:#fafcf9; padding: 10px 12px; color: var(--muted); font-size:12px; }
      .rationale { margin-top: 12px; border:1px solid var(--line); border-radius: 10px; background:#f8fbf7; padding: 10px 12px; }
      .rationale h3 { margin: 0 0 8px; font-size: 13px; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; }
      .rationale p { margin: 8px 0 0; font-size: 12px; color: var(--ink); line-height: 1.5; }
      @media print { .no-print { display:none; } .page { max-width:none; margin:0; padding:12mm; } }
    </style>
  </head>
  <body>
    <main class="page">
      <section class="header">
        <h1>SolarCalc Printable Quote</h1>
        <p>${escapeHtml(projectName)} | Prepared ${escapeHtml(createdAt)}</p>
      </section>

      <h2>Requirements Used</h2>
      <section class="requirements-grid">
        <article class="metric"><h3>Daily Consumption</h3><p>${input.daily_consumption_kwh} kWh</p></article>
        <article class="metric"><h3>Peak Demand</h3><p>${input.peak_demand_w} W</p></article>
        <article class="metric"><h3>Peak Sun Hours</h3><p>${input.peak_sun_hours}</p></article>
        <article class="metric"><h3>Autonomy</h3><p>${input.autonomy_days} day(s)</p></article>
        <article class="metric"><h3>System Type</h3><p>${escapeHtml(input.system_type)}</p></article>
        <article class="metric"><h3>Battery Chemistry</h3><p>${escapeHtml(input.preferred_battery_chemistry)}</p></article>
        <article class="metric"><h3>Panel Module</h3><p>${input.panel_watts}W</p></article>
        <article class="metric"><h3>Panel Electrical</h3><p>Voc ${input.panel_voc}V | Vmp ${input.panel_vmp}V | Isc ${input.panel_isc}A</p></article>
        <article class="metric"><h3>Bifacial</h3><p>${input.panel_is_bifacial ? `Enabled (${input.bifacial_gain_percent}% gain)` : "Disabled"}</p></article>
        <article class="metric"><h3>Motor Loads</h3><p>${input.has_motor_loads ? `Enabled (${input.motor_running_w}W, ${input.motor_starting_multiplier}x start)` : "Disabled"}</p></article>
      </section>

      <h2>Summary</h2>
      <section class="metrics">
        <article class="metric"><h3>System</h3><p>${escapeHtml(result.ogMetadata.title)}</p></article>
        <article class="metric"><h3>Inverter</h3><p>${escapeHtml(result.ogMetadata.stats[0] ?? "N/A")}</p></article>
        <article class="metric"><h3>Battery</h3><p>${escapeHtml(result.ogMetadata.stats[1] ?? "N/A")}</p></article>
        <article class="metric"><h3>Solar Array</h3><p>${escapeHtml(result.ogMetadata.stats[2] ?? "N/A")}</p></article>
        <article class="metric"><h3>Stringing</h3><p>${escapeHtml(result.configuration.panelStringing)}</p></article>
        <article class="metric"><h3>Battery Config</h3><p>${escapeHtml(result.configuration.batteryConfiguration)}</p></article>
      </section>

      <h2>Bill Of Materials</h2>
      <table>
        <thead>
          <tr><th>#</th><th>Category</th><th>SKU</th><th>Description</th><th>Qty</th><th>Specs</th></tr>
        </thead>
        <tbody>${rowsMarkup}</tbody>
      </table>

      <section class="rationale">
        <h3>Requirement-Based Design Notes</h3>
        <p><strong>Inverter from requirements:</strong> ${escapeHtml(result.explanations.inverterLogic)}</p>
        <p><strong>Stringing from requirements:</strong> ${escapeHtml(result.explanations.stringingLogic)}</p>
        <p><strong>Battery from requirements:</strong> ${escapeHtml(result.explanations.batteryLogic)}</p>
      </section>

      <button class="no-print" onclick="window.print()" style="margin-top:14px;padding:10px 14px;border:0;border-radius:10px;background:#1f6d49;color:white;font-weight:700;cursor:pointer;">Print / Save as PDF</button>
    </main>
  </body>
</html>`;
}

export async function GET(_: Request, { params }: Params) {
  const { shareId } = await params;
  const retentionCutoff = getBuildExpiryCutoff();

  const project = await prisma.project.findUnique({
    where: { shareId },
    select: {
      name: true,
      input: true,
      result: true,
      isPublic: true,
      createdAt: true,
    },
  });

  if (!project || !project.isPublic || project.createdAt < retentionCutoff) {
    return NextResponse.json({ error: "Build not found" }, { status: 404 });
  }

  const html = buildQuoteHtml(
    project.name,
    project.input as SolarInputPayload,
    project.result as SolarCalculationResult,
  );

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
