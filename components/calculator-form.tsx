"use client";

import { FormEvent, useMemo, useState } from "react";
import { BlockMath } from "react-katex";
import { SystemDiagram } from "@/components/system-diagram";
import { formatBuildRetentionLabel } from "@/lib/build-retention";
import type {
  SaveResult,
  ShareResult,
  SolarApiResponse,
  SolarCalculationResult,
  SolarInputPayload,
} from "@/lib/calculator/types";

type TermDefinition = {
  term: string;
  definition: string;
};

type SocialPlatform = "facebook" | "x" | "linkedin" | "whatsapp";

const fullReferenceGlossary: TermDefinition[] = [
  {
    term: "Low-Frequency inverter",
    definition:
      "Transformer-based inverter architecture with stronger surge handling, commonly preferred for hard motor starts such as pumps.",
  },
  {
    term: "High-Frequency inverter",
    definition:
      "Switching-based inverter architecture that is compact and efficient, but often with lower surge tolerance than low-frequency designs.",
  },
  {
    term: "Motor starting surge",
    definition:
      "Short-duration power/current spike when a motor starts, often several times higher than running watts.",
  },
  {
    term: "Soft Starter",
    definition:
      "Controller that limits motor inrush current during startup to reduce surge stress on inverter and wiring.",
  },
  {
    term: "VFD",
    definition:
      "Variable Frequency Drive that controls motor speed and can reduce startup current while improving control and efficiency.",
  },
  {
    term: "Gel",
    definition:
      "A sealed lead-acid subtype with gelled electrolyte; maintenance-free but generally slower charging and strict charge settings.",
  },
  {
    term: "Bifacial panel",
    definition:
      "PV module that can harvest irradiance from both front and rear sides. Rear-side contribution is modeled as a gain percentage.",
  },
];

const panelPresets = {
  "450W": { watts: 450, voc: 49.5, vmp: 41.2, isc: 10.8 },
  "650W": { watts: 650, voc: 45.8, vmp: 38.2, isc: 17.9 },
  "730W": { watts: 730, voc: 50.2, vmp: 42.0, isc: 18.4 },
} as const;

function describeStringing(term: string): string | null {
  const match = term.match(/^(\d+)S(\d+)P$/i);
  if (!match) {
    return null;
  }

  const series = Number(match[1]);
  const parallel = Number(match[2]);
  return `${series} in series and ${parallel} in parallel. Series increases voltage; parallel increases current capacity.`;
}

function buildGlossary(result: SolarCalculationResult): TermDefinition[] {
  const entries = new Map<string, string>();

  const add = (term: string, definition: string) => {
    if (!entries.has(term)) {
      entries.set(term, definition);
    }
  };

  const panelStringing = result.configuration.panelStringing;
  const batteryConfiguration = result.configuration.batteryConfiguration;
  const inverterConfiguration = result.configuration.inverterConfiguration;
  const inverterTopology = result.computations.inverter.topology;
  const hasMotorSurge = result.computations.inverter.surgeTargetW > 0;
  const batteryChemistry = result.computations.battery.selectedModel.includes("LiFePO4")
    ? "LiFePO4"
    : "Lead Acid";

  const panelStringingDefinition = describeStringing(panelStringing);
  const batteryStringingDefinition = describeStringing(batteryConfiguration);

  if (panelStringingDefinition) {
    add(panelStringing, `Solar panel stringing: ${panelStringingDefinition}`);
  }

  if (batteryStringingDefinition) {
    add(batteryConfiguration, `Battery bank configuration: ${batteryStringingDefinition}`);
  }

  if (inverterConfiguration === "Split-Phase") {
    add(
      "Split-phase",
      "A 240V arrangement using two synchronized 120V inverter legs that are 180 degrees out of phase, so the system can serve both 120V and 240V loads.",
    );
  }

  if (inverterTopology === "Low-Frequency") {
    add(
      "Low-Frequency inverter",
      "Transformer-based inverter architecture with stronger surge handling, commonly preferred for hard motor starts such as pumps.",
    );
  }

  if (inverterTopology === "High-Frequency") {
    add(
      "High-Frequency inverter",
      "Switching-based inverter architecture that is compact and efficient, but often with lower surge tolerance than low-frequency designs.",
    );
  }

  if (hasMotorSurge) {
    add(
      "Motor starting surge",
      "Short-duration power/current spike when a motor starts, often several times higher than running watts.",
    );
  }

  if (inverterConfiguration === "Parallel") {
    add("Parallel inverter", "Multiple inverter units tied together to increase available output power.");
  }

  if (inverterConfiguration === "Single") {
    add("Single inverter", "One inverter unit handles the full AC output for this design.");
  }

  if (batteryChemistry === "LiFePO4") {
    add(
      "LiFePO4",
      "Lithium Iron Phosphate battery chemistry with high cycle life and high usable depth of discharge.",
    );
  } else {
    add(
      "Lead Acid",
      "Traditional battery chemistry with lower usable depth of discharge and shorter cycle life than LiFePO4.",
    );
  }

  add("MPPT", "Maximum Power Point Tracking: inverter control that keeps PV voltage/current at the panel power sweet spot.");
  add("DoD", "Depth of Discharge: the usable fraction of battery capacity in normal operation.");
  add("Voc", "Open-circuit voltage of a solar panel, used to check max series string voltage limits.");
  add("Vmp", "Voltage at maximum power of a panel, used for practical string design within MPPT range.");
  add("Isc", "Short-circuit current of a panel, used for parallel string current and breaker sizing checks.");
  add("NEC 125% rule", "Continuous currents are multiplied by 1.25 for protective device sizing margin.");
  if (result.computations.solarArray.panelIsBifacial) {
    add(
      "Bifacial panel",
      "PV module that can harvest irradiance from both front and rear sides. Rear-side contribution is modeled as a gain percentage.",
    );
  }

  return Array.from(entries.entries()).map(([term, definition]) => ({ term, definition }));
}

const defaultPayload: SolarInputPayload = {
  daily_consumption_kwh: 20,
  peak_demand_w: 7000,
  system_type: "Off-Grid",
  peak_sun_hours: 5,
  autonomy_days: 2,
  appliance_voltage: 240,
  panel_preset: "650W",
  panel_watts: 650,
  panel_voc: 45.8,
  panel_vmp: 38.2,
  panel_isc: 17.9,
  panel_is_bifacial: true,
  bifacial_gain_percent: 10,
  has_motor_loads: false,
  motor_running_w: 1500,
  motor_starting_multiplier: 3,
  inverter_preference: "Auto",
  preferred_battery_chemistry: "LiFePO4",
  save_project: false,
};

type CalculatorFormProps = {
  userEmail: string | null;
};

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildQuoteHtml(payload: SolarInputPayload, result: SolarCalculationResult): string {
  const createdAt = new Date().toLocaleString();

  const summaryCards = [
    { label: "System", value: result.ogMetadata.title },
    { label: "Inverter", value: result.ogMetadata.stats[0] ?? "N/A" },
    { label: "Battery", value: result.ogMetadata.stats[1] ?? "N/A" },
    { label: "Solar Array", value: result.ogMetadata.stats[2] ?? "N/A" },
    { label: "Panel Stringing", value: result.configuration.panelStringing },
    { label: "Battery Config", value: result.configuration.batteryConfiguration },
  ];

  const summaryMarkup = summaryCards
    .map(
      (card) => `
        <article class="card">
          <p class="label">${escapeHtml(card.label)}</p>
          <p class="value">${escapeHtml(card.value)}</p>
        </article>
      `,
    )
    .join("");

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
          <td class="qty">${item.quantity}</td>
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
    <title>SolarCalc Quote</title>
    <style>
      :root {
        --ink: #10231a;
        --muted: #4a5e54;
        --line: #d4ddd4;
        --accent: #1f6d49;
        --soft: #f4f8f3;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Segoe UI", Tahoma, sans-serif;
        color: var(--ink);
        background: #fff;
      }
      .page {
        max-width: 980px;
        margin: 0 auto;
        padding: 36px 34px 40px;
      }
      .header {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        padding: 20px 22px;
        border: 1px solid var(--line);
        border-radius: 14px;
        background: linear-gradient(120deg, #0f2d20, #2e6a43 64%, #6ea45a);
        color: #eef8ef;
      }
      .header h1 {
        margin: 0;
        font-size: 30px;
        line-height: 1.1;
      }
      .header p {
        margin: 8px 0 0;
        color: rgba(238, 248, 239, 0.9);
      }
      .meta {
        text-align: right;
        font-size: 12px;
      }
      .meta strong {
        display: block;
        font-size: 13px;
        margin-bottom: 4px;
      }
      h2 {
        margin: 22px 0 12px;
        font-size: 16px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--muted);
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
      }
      .requirements-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }
      .card {
        border: 1px solid var(--line);
        border-radius: 10px;
        background: var(--soft);
        padding: 10px;
      }
      .label {
        margin: 0;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--muted);
      }
      .value {
        margin: 7px 0 0;
        font-weight: 700;
        font-size: 14px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid var(--line);
      }
      thead th {
        text-align: left;
        font-size: 12px;
        padding: 10px;
        background: #edf4ee;
        border-bottom: 1px solid var(--line);
      }
      tbody td {
        font-size: 12px;
        padding: 10px;
        border-bottom: 1px solid #e6ece6;
        vertical-align: top;
      }
      .qty {
        text-align: center;
        font-weight: 700;
      }
      .notes {
        margin-top: 14px;
        border: 1px solid var(--line);
        border-radius: 10px;
        padding: 12px;
        background: #fafcf9;
        font-size: 12px;
        color: var(--muted);
      }
      .assumptions {
        margin-top: 12px;
        font-size: 12px;
        color: var(--muted);
        line-height: 1.5;
      }
      .rationale {
        margin-top: 12px;
        border: 1px solid var(--line);
        border-radius: 10px;
        padding: 12px;
        background: #f8fbf7;
      }
      .rationale h3 {
        margin: 0 0 8px;
        font-size: 13px;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .rationale p {
        margin: 8px 0 0;
        font-size: 12px;
        color: var(--ink);
        line-height: 1.5;
      }
      @media print {
        .page {
          max-width: none;
          margin: 0;
          padding: 12mm;
        }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <section class="header">
        <div>
          <h1>SolarCalc Printable Quote</h1>
          <p>Engineering estimate based on provided load and site assumptions.</p>
        </div>
        <div class="meta">
          <strong>Prepared</strong>
          ${escapeHtml(createdAt)}
          <br /><br />
          <strong>Voltage</strong>
          ${payload.appliance_voltage === 240 ? "220V/240V class" : "110V/120V class"}
        </div>
      </section>

      <h2>Requirements Used</h2>
      <section class="requirements-grid">
        <article class="card"><p class="label">Daily Consumption</p><p class="value">${payload.daily_consumption_kwh} kWh</p></article>
        <article class="card"><p class="label">Peak Demand</p><p class="value">${payload.peak_demand_w} W</p></article>
        <article class="card"><p class="label">Peak Sun Hours</p><p class="value">${payload.peak_sun_hours}</p></article>
        <article class="card"><p class="label">Autonomy</p><p class="value">${payload.autonomy_days} day(s)</p></article>
        <article class="card"><p class="label">System Type</p><p class="value">${escapeHtml(payload.system_type)}</p></article>
        <article class="card"><p class="label">Battery Chemistry</p><p class="value">${escapeHtml(payload.preferred_battery_chemistry)}</p></article>
        <article class="card"><p class="label">Panel Module</p><p class="value">${payload.panel_watts}W</p></article>
        <article class="card"><p class="label">Panel Electrical</p><p class="value">Voc ${payload.panel_voc}V | Vmp ${payload.panel_vmp}V | Isc ${payload.panel_isc}A</p></article>
        <article class="card"><p class="label">Bifacial</p><p class="value">${payload.panel_is_bifacial ? `Enabled (${payload.bifacial_gain_percent}% gain)` : "Disabled"}</p></article>
        <article class="card"><p class="label">Motor Loads</p><p class="value">${payload.has_motor_loads ? `Enabled (${payload.motor_running_w}W, ${payload.motor_starting_multiplier}x)` : "Disabled"}</p></article>
      </section>

      <h2>System Summary</h2>
      <section class="grid">${summaryMarkup}</section>

      <h2>Bill Of Materials</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Category</th>
            <th>SKU</th>
            <th>Description</th>
            <th>Qty</th>
            <th>Specifications</th>
          </tr>
        </thead>
        <tbody>${rowsMarkup}</tbody>
      </table>

      <section class="notes">
        <strong>Scope Note:</strong> This quote includes engineering sizing outputs and component quantities.
        Unit pricing, taxes, logistics, and labor are intentionally excluded and can be added in a commercial proposal.
      </section>

      <section class="rationale">
        <h3>Requirement-Based Design Notes</h3>
        <p><strong>Inverter from requirements:</strong> ${escapeHtml(result.explanations.inverterLogic)}</p>
        <p><strong>Stringing from requirements:</strong> ${escapeHtml(result.explanations.stringingLogic)}</p>
        <p><strong>Battery from requirements:</strong> ${escapeHtml(result.explanations.batteryLogic)}</p>
      </section>
    </main>
  </body>
</html>`;
}

export function CalculatorForm({ userEmail }: CalculatorFormProps) {
  const [payload, setPayload] = useState<SolarInputPayload>(defaultPayload);
  const [result, setResult] = useState<SolarCalculationResult | null>(null);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);
  const [shareResult, setShareResult] = useState<ShareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingToAccount, setSavingToAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [selectedSharePlatform, setSelectedSharePlatform] = useState<SocialPlatform>("facebook");

  const quickStats = useMemo(() => {
    if (!result) {
      return [];
    }

    return [
      { label: "Inverter", value: result.ogMetadata.stats[0] ?? "N/A" },
      { label: "Battery", value: result.ogMetadata.stats[1] ?? "N/A" },
      { label: "Solar Array", value: result.ogMetadata.stats[2] ?? "N/A" },
      { label: "Stringing", value: result.configuration.panelStringing },
    ];
  }, [result]);

  const equationRows = useMemo(() => {
    if (!result) {
      return [];
    }

    const { computations } = result;

    return [
      {
        title: "Inverter target power",
        equation: `P_{target} = ${computations.inverter.formula.replaceAll("*", "\\times")} = ${computations.inverter.finalRequiredW.toFixed(2)}\\,\\mathrm{W}`,
      },
      ...(computations.inverter.surgeTargetW > 0
        ? [
            {
              title: "Motor starting surge",
              equation: `P_{surge} = ${computations.inverter.surgeTargetW.toFixed(2)}\\,\\mathrm{W}`,
            },
          ]
        : []),
      {
        title: "Battery bank energy",
        equation: `E_{battery} = ${computations.battery.formula.replaceAll("*", "\\times")} = ${computations.battery.targetKwh.toFixed(2)}\\,\\mathrm{kWh}`,
      },
      {
        title: "Array target power",
        equation: `P_{array} = ${computations.solarArray.formula.replaceAll("*", "\\times")} = ${computations.solarArray.targetW.toFixed(2)}\\,\\mathrm{W}`,
      },
      {
        title: "Effective panel power",
        equation: computations.solarArray.panelIsBifacial
          ? `P_{panel,eff} = ${computations.solarArray.panelWatts.toFixed(2)}\\times\\left(1+${(
              computations.solarArray.bifacialGainPercent / 100
            ).toFixed(3)}\\right) = ${computations.solarArray.panelEffectiveWatts.toFixed(2)}\\,\\mathrm{W}`
          : `P_{panel,eff} = ${computations.solarArray.panelWatts.toFixed(2)}\\,\\mathrm{W}`,
      },
      {
        title: "PV current and DC breaker",
        equation: `I_{pv} = ${computations.protection.pvCurrentA.toFixed(2)}\\,\\mathrm{A},\\quad I_{dc\\ breaker} = 1.25\\times I_{pv} \Rightarrow ${computations.protection.dcBreakerA}\\,\\mathrm{A}`,
      },
      {
        title: "AC current and AC breaker",
        equation: `I_{ac} = ${computations.protection.acCurrentA.toFixed(2)}\\,\\mathrm{A},\\quad I_{ac\\ breaker} = 1.25\\times I_{ac} \Rightarrow ${computations.protection.acBreakerA}\\,\\mathrm{A}`,
      },
    ];
  }, [result]);

  const glossaryRows = useMemo(() => {
    if (!result) {
      return [];
    }

    return buildGlossary(result);
  }, [result]);

  const fullGlossaryRows = useMemo(() => {
    const byTerm = new Map<string, string>();

    for (const item of glossaryRows) {
      byTerm.set(item.term, item.definition);
    }

    for (const item of fullReferenceGlossary) {
      if (!byTerm.has(item.term)) {
        byTerm.set(item.term, item.definition);
      }
    }

    return Array.from(byTerm.entries()).map(([term, definition]) => ({ term, definition }));
  }, [glossaryRows]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...payload, save_project: false }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Request failed");
      }

      const data: SolarApiResponse = await response.json();
      setResult(data.result);
      setSaveResult(data.save);
      setShareResult(data.share);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unexpected error while calculating.",
      );
      setResult(null);
      setSaveResult(null);
      setShareResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function saveBuildToAccount() {
    if (!userEmail) {
      window.location.href = "/api/auth/signin/google?callbackUrl=/";
      return;
    }

    setSavingToAccount(true);
    setError(null);

    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...payload, save_project: true }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Save request failed");
      }

      const data: SolarApiResponse = await response.json();
      setSaveResult(data.save);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unexpected error while saving build.",
      );
    } finally {
      setSavingToAccount(false);
    }
  }

  function applyPanelPreset(preset: "450W" | "650W" | "730W" | "Custom") {
    if (preset === "Custom") {
      setPayload((p) => ({ ...p, panel_preset: "Custom" }));
      return;
    }

    const profile = panelPresets[preset];
    setPayload((p) => ({
      ...p,
      panel_preset: preset,
      panel_watts: profile.watts,
      panel_voc: profile.voc,
      panel_vmp: profile.vmp,
      panel_isc: profile.isc,
    }));
  }

  async function copyShareUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setShareNotice("Share URL copied.");
    } catch {
      setShareNotice("Could not copy URL automatically. Please copy it manually.");
    }
  }

  function isPublicShareUrl(shareUrl: string) {
    try {
      const host = new URL(shareUrl).hostname.toLowerCase();
      return !(host === "localhost" || host === "127.0.0.1" || host.endsWith(".local"));
    } catch {
      return false;
    }
  }

  function openSocialShare(platform: SocialPlatform, shareUrl: string) {
    if (!isPublicShareUrl(shareUrl)) {
      setShareNotice("Social apps need a public URL. Update NEXT_PUBLIC_APP_URL to your live domain, then save the project again.");
      return;
    }

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent("Check out this SolarCalc design build.");

    const shareTargets = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`Check out this SolarCalc design build: ${shareUrl}`)}`,
    };

    const popup = window.open(shareTargets[platform], "_blank", "noopener,noreferrer");
    if (!popup) {
      setShareNotice("Unable to open share dialog. Please allow popups for this site.");
    }
  }

  function exportCurrentBuild() {
    if (!result) {
      return;
    }

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      input: payload,
      result,
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "solarcalc-build-export.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function exportQuotePdf() {
    if (!result) {
      return;
    }

    const quoteHtml = buildQuoteHtml(payload, result);

    const frame = document.createElement("iframe");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    frame.setAttribute("aria-hidden", "true");
    document.body.appendChild(frame);

    const frameDoc = frame.contentDocument;
    const frameWin = frame.contentWindow;

    if (!frameDoc || !frameWin) {
      document.body.removeChild(frame);
      setShareNotice("Print preview could not open. Please try again.");
      return;
    }

    frameDoc.open();
    frameDoc.write(quoteHtml);
    frameDoc.close();

    frame.onload = () => {
      frameWin.focus();
      frameWin.print();

      window.setTimeout(() => {
        if (document.body.contains(frame)) {
          document.body.removeChild(frame);
        }
      }, 1500);
    };
  }

  return (
    <section className="grid" style={{ gap: 20 }}>
      <form onSubmit={onSubmit} className="panel stack">
        <section className="form-section stack">
          <h3 style={{ margin: 0 }}>1) Load Profile</h3>
          <div className="grid grid-2">
            <Field
              label="Daily Consumption (kWh)"
              helpText="Your total energy use in one day from your bill or estimate."
              value={payload.daily_consumption_kwh}
              onChange={(v) => setPayload((p) => ({ ...p, daily_consumption_kwh: v }))}
            />
            <Field
              label="Peak Demand (W)"
              helpText="Highest watts running at the same time."
              value={payload.peak_demand_w}
              onChange={(v) => setPayload((p) => ({ ...p, peak_demand_w: v }))}
            />
            <SelectField
              label="System Type"
              helpText="Off-grid = no utility dependence, Hybrid = with battery + grid, Grid-tied = no backup."
              value={payload.system_type}
              onChange={(v) => setPayload((p) => ({ ...p, system_type: v as SolarInputPayload["system_type"] }))}
              options={["Off-Grid", "Grid-Tied", "Hybrid"]}
            />
            <Field
              label="Peak Sun Hours"
              helpText="Average full-sun equivalent hours for your location."
              value={payload.peak_sun_hours}
              onChange={(v) => setPayload((p) => ({ ...p, peak_sun_hours: v }))}
            />
            <Field
              label="Autonomy Days"
              helpText="How many days the battery should support loads with little/no solar."
              value={payload.autonomy_days}
              onChange={(v) => setPayload((p) => ({ ...p, autonomy_days: v }))}
            />
            <SelectField
              label="Appliance Voltage (PH)"
              helpText="Choose the service/loads you need to support."
              value={String(payload.appliance_voltage)}
              onChange={(v) =>
                setPayload((p) => ({ ...p, appliance_voltage: Number(v) as 120 | 240 }))
              }
              options={[
                { value: "120", label: "110V (PH single-phase branch loads)" },
                { value: "240", label: "220V (PH typical household service)" },
              ]}
            />
          </div>
        </section>

        <section className="form-section stack">
          <h3 style={{ margin: 0 }}>2) Solar Panel Setup</h3>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.92rem" }}>
            No panel datasheet yet? You can keep the preset values as-is. Only edit Voc, Vmp, and Isc if you already have the exact panel specs.
          </p>
          <div className="grid grid-2">
            <SelectField
              label="Panel Preset"
              helpText="Quick-select common module classes, or choose Custom."
              value={payload.panel_preset}
              onChange={(v) => applyPanelPreset(v as SolarInputPayload["panel_preset"])}
              options={["450W", "650W", "730W", "Custom"]}
            />
            <Field
              label="Panel Wattage (W)"
              helpText="Nameplate power of one panel."
              value={payload.panel_watts}
              onChange={(v) =>
                setPayload((p) => ({
                  ...p,
                  panel_watts: v,
                  panel_preset: "Custom",
                }))
              }
            />
            <Field
              label="Panel Voc (V)"
              helpText="Advanced: open-circuit voltage from panel datasheet. Safe to keep preset if you do not have exact specs yet."
              value={payload.panel_voc}
              onChange={(v) => setPayload((p) => ({ ...p, panel_voc: v, panel_preset: "Custom" }))}
            />
            <Field
              label="Panel Vmp (V)"
              helpText="Advanced: voltage at maximum power from panel datasheet. Keep preset when panel is not finalized."
              value={payload.panel_vmp}
              onChange={(v) => setPayload((p) => ({ ...p, panel_vmp: v, panel_preset: "Custom" }))}
            />
            <Field
              label="Panel Isc (A)"
              helpText="Advanced: short-circuit current from panel datasheet. Keep preset unless exact panel specs are available."
              value={payload.panel_isc}
              onChange={(v) => setPayload((p) => ({ ...p, panel_isc: v, panel_preset: "Custom" }))}
            />
            <SelectField
              label="Bifacial Panel"
              helpText="Enable if the module can harvest light from both sides."
              value={payload.panel_is_bifacial ? "true" : "false"}
              onChange={(v) => setPayload((p) => ({ ...p, panel_is_bifacial: v === "true" }))}
              options={[
                { value: "true", label: "Yes" },
                { value: "false", label: "No" },
              ]}
            />
            {payload.panel_is_bifacial ? (
              <Field
                label="Bifacial Gain (%)"
                helpText="Extra yield estimate from rear-side capture."
                value={payload.bifacial_gain_percent}
                onChange={(v) => setPayload((p) => ({ ...p, bifacial_gain_percent: v }))}
              />
            ) : null}
          </div>
        </section>

        <section className="form-section stack">
          <h3 style={{ margin: 0 }}>3) Motor And Inverter</h3>
          <div className="grid grid-2">
            <SelectField
              label="Motor/Pump Loads"
              helpText="Turn this on if you have pumps/compressors with high startup surge."
              value={payload.has_motor_loads ? "true" : "false"}
              onChange={(v) =>
                setPayload((p) => ({
                  ...p,
                  has_motor_loads: v === "true",
                }))
              }
              options={[
                { value: "false", label: "No" },
                { value: "true", label: "Yes" },
              ]}
            />
            {payload.has_motor_loads ? (
              <>
                <Field
                  label="Largest Motor/Pump Running Watts"
                  helpText="Running power of the largest motor load."
                  value={payload.motor_running_w}
                  onChange={(v) => setPayload((p) => ({ ...p, motor_running_w: v }))}
                />
                <Field
                  label="Motor Starting Multiplier"
                  helpText="Typical startup multiplier is around 2x to 5x."
                  value={payload.motor_starting_multiplier}
                  onChange={(v) => setPayload((p) => ({ ...p, motor_starting_multiplier: v }))}
                />
                <SelectField
                  label="Inverter Topology Preference"
                  helpText="Auto recommends low-frequency for stronger motor-start handling."
                  value={payload.inverter_preference}
                  onChange={(v) =>
                    setPayload((p) => ({
                      ...p,
                      inverter_preference: v as SolarInputPayload["inverter_preference"],
                    }))
                  }
                  options={["Auto", "Low-Frequency", "High-Frequency"]}
                />
              </>
            ) : null}
          </div>
        </section>

        <section className="form-section stack">
          <h3 style={{ margin: 0 }}>4) Battery</h3>
          <div className="grid grid-2">
            <SelectField
              label="Battery Chemistry"
              helpText="LiFePO4 usually allows deeper daily usage and longer cycle life."
              value={payload.preferred_battery_chemistry}
              onChange={(v) =>
                setPayload((p) => ({
                  ...p,
                  preferred_battery_chemistry: v as SolarInputPayload["preferred_battery_chemistry"],
                }))
              }
              options={["LiFePO4", "Lead Acid"]}
            />
          </div>
        </section>
        <button type="submit" disabled={loading}>
          {loading ? "Calculating..." : "Calculate System"}
        </button>
        <p style={{ margin: 0, color: "var(--muted)" }}>
          Signed in: {userEmail ?? "No"}
        </p>
        {error ? <p className="error">{error}</p> : null}
      </form>

      {result ? (
        <section className="panel stack">
          <h2 style={{ margin: 0 }}>{result.ogMetadata.title}</h2>
          <div className="metrics">
            {quickStats.map((item) => (
              <article className="metric" key={item.label}>
                <h3>{item.label}</h3>
                <p>{item.value}</p>
              </article>
            ))}
          </div>
          {saveResult?.attempted ? (
            <div className="save-status">
              <strong>{saveResult.saved ? "Project saved." : "Project not saved."}</strong>
              {saveResult.reason ? <p style={{ margin: "4px 0 0" }}>{saveResult.reason}</p> : null}
            </div>
          ) : null}
          {shareResult?.saved && shareResult.shareUrl ? (
            <div className="save-status">
              <strong>Share link ready.</strong>
              <p style={{ margin: "4px 0 0" }}>
                Share URL: <a href={shareResult.shareUrl}>{shareResult.shareUrl}</a>
              </p>
              <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
                Note: shared builds expire after {formatBuildRetentionLabel()}.
              </p>
            </div>
          ) : null}
          <div className="action-row">
            <button type="button" onClick={exportCurrentBuild}>
              Export Build JSON
            </button>
            <button type="button" onClick={exportQuotePdf}>
              Export Quote PDF
            </button>
            <button type="button" onClick={saveBuildToAccount} disabled={savingToAccount || saveResult?.saved}>
              {saveResult?.saved
                ? "Saved To Account"
                : savingToAccount
                  ? "Saving..."
                  : userEmail
                    ? "Save To My Account"
                    : "Sign In To Save Build"}
            </button>
            {shareResult?.shareUrl ? (
              <>
                <button type="button" onClick={() => copyShareUrl(shareResult.shareUrl!)}>
                  Copy Share URL
                </button>
                <a
                  className="button-ghost"
                  href={`/api/export/${shareResult.shareUrl!.split("/").pop()}`}
                >
                  Download Public Export
                </a>
              </>
            ) : null}
          </div>
          {shareResult?.shareUrl ? (
            <div className="action-row share-control">
              <label htmlFor="share-platform" style={{ margin: 0, minWidth: 82 }}>
                Share To
              </label>
              <select
                id="share-platform"
                className="share-select"
                value={selectedSharePlatform}
                onChange={(event) => setSelectedSharePlatform(event.target.value as SocialPlatform)}
              >
                <option value="facebook">Facebook</option>
                <option value="x">X</option>
                <option value="linkedin">LinkedIn</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
              <button
                className="social-button"
                type="button"
                onClick={() => openSocialShare(selectedSharePlatform, shareResult.shareUrl!)}
              >
                Share Build
              </button>
            </div>
          ) : (
            <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
              To share on social media, enable Save Project and calculate to generate a public share link.
            </p>
          )}
          {shareNotice ? <p style={{ margin: "0" }}>{shareNotice}</p> : null}
          <h3 style={{ margin: 0 }}>System Diagram</h3>
          <SystemDiagram data={result.reactFlowData} />
          <h3 style={{ margin: 0 }}>Computation Formulas</h3>
          <div className="stack" style={{ gap: 12 }}>
            {equationRows.map((row) => (
              <article className="metric" key={row.title}>
                <h3>{row.title}</h3>
                <BlockMath math={row.equation} />
              </article>
            ))}
          </div>
          <h3 style={{ margin: 0 }}>Explanations</h3>
          <div className="stack" style={{ gap: 8 }}>
            <p style={{ margin: 0 }}>
              <strong>Inverter:</strong> {result.explanations.inverterLogic}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Stringing:</strong> {result.explanations.stringingLogic}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Battery:</strong> {result.explanations.batteryLogic}
            </p>
          </div>
          <details>
            <summary style={{ cursor: "pointer", fontWeight: 700 }}>
              Required for this Build ({glossaryRows.length})
            </summary>
            <div className="stack" style={{ gap: 10, marginTop: 10 }}>
              {glossaryRows.map((item) => (
                <article className="metric" key={item.term}>
                  <h3>{item.term}</h3>
                  <p style={{ marginTop: 8, fontSize: "0.95rem", fontWeight: 500 }}>
                    {item.definition}
                  </p>
                </article>
              ))}
            </div>
          </details>
          <details>
            <summary style={{ cursor: "pointer", fontWeight: 700 }}>
              Full Glossary Reference ({fullGlossaryRows.length})
            </summary>
            <div className="stack" style={{ gap: 10, marginTop: 10 }}>
              {fullGlossaryRows.map((item) => (
                <article className="metric" key={`full-${item.term}`}>
                  <h3>{item.term}</h3>
                  <p style={{ marginTop: 8, fontSize: "0.95rem", fontWeight: 500 }}>
                    {item.definition}
                  </p>
                </article>
              ))}
            </div>
          </details>
          <details>
            <summary style={{ cursor: "pointer", fontWeight: 700 }}>
              Raw Result Payload (JSON)
            </summary>
            <pre style={{ marginTop: 10 }}>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </section>
      ) : null}
    </section>
  );
}

type FieldProps = {
  label: string;
  helpText?: string;
  value: number;
  onChange: (value: number) => void;
};

function Field({ label, helpText, value, onChange }: FieldProps) {
  return (
    <div>
      <label>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {helpText ? <p className="help-text">{helpText}</p> : null}
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  helpText?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<string | { value: string; label: string }>;
};

function SelectField({ label, helpText, value, onChange, options }: SelectFieldProps) {
  return (
    <div>
      <label>{label}</label>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => {
          if (typeof option === "string") {
            return (
              <option key={option} value={option}>
                {option}
              </option>
            );
          }

          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </select>
      {helpText ? <p className="help-text">{helpText}</p> : null}
    </div>
  );
}

