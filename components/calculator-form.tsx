"use client";

import { FormEvent, useMemo, useState } from "react";
import { SystemDiagram } from "@/components/system-diagram";
import type {
  SaveResult,
  SolarApiResponse,
  SolarCalculationResult,
  SolarInputPayload,
} from "@/lib/calculator/types";

const defaultPayload: SolarInputPayload = {
  daily_consumption_kwh: 20,
  peak_demand_w: 7000,
  system_type: "Off-Grid",
  peak_sun_hours: 5,
  autonomy_days: 2,
  appliance_voltage: 240,
  preferred_battery_chemistry: "LiFePO4",
  save_project: false,
};

type CalculatorFormProps = {
  userEmail: string | null;
};

export function CalculatorForm({ userEmail }: CalculatorFormProps) {
  const [payload, setPayload] = useState<SolarInputPayload>(defaultPayload);
  const [result, setResult] = useState<SolarCalculationResult | null>(null);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Request failed");
      }

      const data: SolarApiResponse = await response.json();
      setResult(data.result);
      setSaveResult(data.save);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unexpected error while calculating.",
      );
      setResult(null);
      setSaveResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grid" style={{ gap: 20 }}>
      <form onSubmit={onSubmit} className="panel stack">
        <div className="grid grid-2">
          <Field
            label="Daily Consumption (kWh)"
            value={payload.daily_consumption_kwh}
            onChange={(v) => setPayload((p) => ({ ...p, daily_consumption_kwh: v }))}
          />
          <Field
            label="Peak Demand (W)"
            value={payload.peak_demand_w}
            onChange={(v) => setPayload((p) => ({ ...p, peak_demand_w: v }))}
          />
          <SelectField
            label="System Type"
            value={payload.system_type}
            onChange={(v) => setPayload((p) => ({ ...p, system_type: v as SolarInputPayload["system_type"] }))}
            options={["Off-Grid", "Grid-Tied", "Hybrid"]}
          />
          <Field
            label="Peak Sun Hours"
            value={payload.peak_sun_hours}
            onChange={(v) => setPayload((p) => ({ ...p, peak_sun_hours: v }))}
          />
          <Field
            label="Autonomy Days"
            value={payload.autonomy_days}
            onChange={(v) => setPayload((p) => ({ ...p, autonomy_days: v }))}
          />
          <SelectField
            label="Appliance Voltage"
            value={String(payload.appliance_voltage)}
            onChange={(v) =>
              setPayload((p) => ({ ...p, appliance_voltage: Number(v) as 120 | 240 }))
            }
            options={["120", "240"]}
          />
          <SelectField
            label="Battery Chemistry"
            value={payload.preferred_battery_chemistry}
            onChange={(v) =>
              setPayload((p) => ({
                ...p,
                preferred_battery_chemistry: v as SolarInputPayload["preferred_battery_chemistry"],
              }))
            }
            options={["LiFePO4", "Lead Acid"]}
          />
          <SelectField
            label="Save Project"
            value={payload.save_project ? "true" : "false"}
            onChange={(v) => setPayload((p) => ({ ...p, save_project: v === "true" }))}
            options={["false", "true"]}
          />
        </div>
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
              {saveResult.shareUrl ? (
                <p style={{ margin: "4px 0 0" }}>
                  Share URL: <a href={saveResult.shareUrl}>{saveResult.shareUrl}</a>
                </p>
              ) : null}
            </div>
          ) : null}
          <h3 style={{ margin: 0 }}>System Diagram</h3>
          <SystemDiagram data={result.reactFlowData} />
          <h3 style={{ margin: 0 }}>Raw Result Payload</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </section>
      ) : null}
    </section>
  );
}

type FieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

function Field({ label, value, onChange }: FieldProps) {
  return (
    <div>
      <label>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
};

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <div>
      <label>{label}</label>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}