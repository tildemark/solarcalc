import { BomItem, SolarCalculationResult, SolarInputPayload } from "@/lib/calculator/types";

type InverterModel = {
  sku: string;
  label: string;
  ratedW: number;
  dcVoltage: 48;
  mpptMinV: number;
  mpptMaxV: number;
  maxInputCurrentA: number;
  outputV: 120;
};

type BatteryModel = {
  sku: string;
  label: string;
  chemistry: "LiFePO4" | "Lead Acid";
  nominalVoltage: 48;
  nominalKwh: number;
};

const panel = {
  sku: "PANEL-450M",
  label: "450W Mono PERC Module",
  watts: 450,
  voc: 49.5,
  vmp: 41.2,
  isc: 10.8,
};

const inverters: InverterModel[] = [
  {
    sku: "INV-8K-48",
    label: "8kW Hybrid Inverter",
    ratedW: 8000,
    dcVoltage: 48,
    mpptMinV: 120,
    mpptMaxV: 480,
    maxInputCurrentA: 26,
    outputV: 120,
  },
  {
    sku: "INV-12K-48",
    label: "12kW Hybrid Inverter",
    ratedW: 12000,
    dcVoltage: 48,
    mpptMinV: 150,
    mpptMaxV: 500,
    maxInputCurrentA: 30,
    outputV: 120,
  },
];

const batteries: BatteryModel[] = [
  {
    sku: "BAT-LFP-5K",
    label: "5kWh LiFePO4 Rack Battery",
    chemistry: "LiFePO4",
    nominalVoltage: 48,
    nominalKwh: 5,
  },
  {
    sku: "BAT-LA-2P4K",
    label: "2.4kWh Lead Acid Battery",
    chemistry: "Lead Acid",
    nominalVoltage: 48,
    nominalKwh: 2.4,
  },
];

function ceilToStep(value: number, step: number) {
  return Math.ceil(value / step) * step;
}

function validate(payload: SolarInputPayload) {
  const numbers = [
    payload.daily_consumption_kwh,
    payload.peak_demand_w,
    payload.peak_sun_hours,
    payload.autonomy_days,
  ];

  if (numbers.some((n) => !Number.isFinite(n) || n <= 0)) {
    throw new Error("All numeric inputs must be greater than zero.");
  }
}

export function calculateSolarSystem(payload: SolarInputPayload): SolarCalculationResult {
  validate(payload);

  const inverterTargetW = payload.peak_demand_w * 1.25;
  const selectedInverter = [...inverters].sort((a, b) => a.ratedW - b.ratedW).find((i) => i.ratedW >= inverterTargetW) ?? inverters[inverters.length - 1];
  let inverterCount = Math.max(1, Math.ceil(inverterTargetW / selectedInverter.ratedW));

  let inverterConfiguration: "Single" | "Parallel" | "Split-Phase" = inverterCount > 1 ? "Parallel" : "Single";
  if (payload.appliance_voltage === 240 && inverterCount < 2) {
    inverterCount = 2;
    inverterConfiguration = "Split-Phase";
  } else if (payload.appliance_voltage === 240 && inverterCount >= 2) {
    inverterConfiguration = "Split-Phase";
  }

  const dod = payload.preferred_battery_chemistry === "LiFePO4" ? 0.8 : 0.5;
  const batteryTargetKwh = (payload.daily_consumption_kwh * payload.autonomy_days) / dod;
  const batteryModel = batteries.find((b) => b.chemistry === payload.preferred_battery_chemistry) ?? batteries[0];
  const batteryQty = Math.max(1, Math.ceil(batteryTargetKwh / batteryModel.nominalKwh));
  const batterySeries = Math.max(1, Math.round(selectedInverter.dcVoltage / batteryModel.nominalVoltage));
  const batteryParallel = Math.max(1, Math.ceil(batteryQty / batterySeries));

  const arrayTargetW = (payload.daily_consumption_kwh / payload.peak_sun_hours) * 1000 * 1.2;
  const panelQtyTarget = Math.max(1, Math.ceil(arrayTargetW / panel.watts));

  const maxSeries = Math.max(1, Math.floor(selectedInverter.mpptMaxV / panel.voc));
  const minSeries = Math.max(1, Math.ceil(selectedInverter.mpptMinV / panel.voc));
  const midpointSeries = Math.round(((selectedInverter.mpptMinV + selectedInverter.mpptMaxV) / 2) / panel.vmp);
  const series = Math.min(maxSeries, Math.max(minSeries, midpointSeries));

  let parallel = Math.max(1, Math.ceil(panelQtyTarget / series));
  const maxParallelByCurrent = Math.max(
    1,
    Math.floor((selectedInverter.maxInputCurrentA * inverterCount) / panel.isc),
  );
  if (parallel > maxParallelByCurrent) {
    parallel = maxParallelByCurrent;
  }

  const panelQty = series * parallel;
  const pvCurrentA = parallel * panel.isc;
  const dcBreakerA = ceilToStep(pvCurrentA * 1.25, 5);
  const acCurrentA = (inverterTargetW / payload.appliance_voltage) * 1.25;
  const acBreakerA = ceilToStep(acCurrentA, 5);

  const inverterKw = (selectedInverter.ratedW * inverterCount) / 1000;
  const batteryTotalKwh = batteryModel.nominalKwh * batteryQty;
  const arrayKw = (panel.watts * panelQty) / 1000;

  const bomItems: BomItem[] = [
    {
      category: "Inverter",
      sku: selectedInverter.sku,
      description: selectedInverter.label,
      quantity: inverterCount,
      specs: {
        isStacked: inverterCount > 1,
        configuration: inverterConfiguration,
      } as Record<string, string | number | boolean>,
    },
    {
      category: "Solar Panel",
      sku: panel.sku,
      description: panel.label,
      quantity: panelQty,
      specs: {
        wattsPerPanel: panel.watts,
      } as Record<string, string | number | boolean>,
    },
    {
      category: "Battery",
      sku: batteryModel.sku,
      description: batteryModel.label,
      quantity: batteryQty,
      specs: {
        chemistry: batteryModel.chemistry,
      } as Record<string, string | number | boolean>,
    },
    {
      category: "Protection",
      sku: "BRK-DC",
      description: "DC breaker",
      quantity: 1,
      specs: {
        amps: dcBreakerA,
      } as Record<string, string | number | boolean>,
    },
    {
      category: "Protection",
      sku: "BRK-AC",
      description: "AC output breaker",
      quantity: 1,
      specs: {
        amps: acBreakerA,
      } as Record<string, string | number | boolean>,
    },
    {
      category: "Mounting",
      sku: "MNT-RAIL-KIT",
      description: "Panel rail and clamp kit",
      quantity: panelQty,
    },
    {
      category: "Accessories",
      sku: "SYNC-CBL",
      description: "Inverter sync cable",
      quantity: Math.max(0, inverterCount - 1),
    },
  ];

  const nodes = [
    {
      id: "solar-array",
      type: "solarArrayNode",
      position: { x: 80, y: 40 },
      data: {
        label: "Solar Array",
        stringing: `${series}S${parallel}P`,
        panelCount: panelQty,
      },
    },
    {
      id: "inverter-bank",
      type: "inverterNode",
      position: { x: 380, y: 180 },
      data: {
        label: selectedInverter.label,
        units: inverterCount,
        mode: inverterConfiguration,
      },
    },
    {
      id: "battery-bank",
      type: "batteryNode",
      position: { x: 80, y: 300 },
      data: {
        label: "Battery Bank",
        configuration: `${batterySeries}S${batteryParallel}P`,
        chemistry: batteryModel.chemistry,
      },
    },
    {
      id: "load-center",
      type: "loadNode",
      position: { x: 680, y: 180 },
      data: {
        label: payload.system_type === "Grid-Tied" ? "Main Panel" : "Critical Loads Panel",
        voltage: payload.appliance_voltage,
      },
    },
  ];

  const edges = [
    {
      id: "e-solar-inverter",
      source: "solar-array",
      target: "inverter-bank",
      label: "PV DC",
    },
    {
      id: "e-battery-inverter",
      source: "battery-bank",
      target: "inverter-bank",
      label: "Battery DC",
    },
    {
      id: "e-inverter-load",
      source: "inverter-bank",
      target: "load-center",
      label: "AC Output",
    },
  ];

  return {
    bom: {
      items: bomItems,
    },
    configuration: {
      panelStringing: `${series}S${parallel}P`,
      batteryConfiguration: `${batterySeries}S${batteryParallel}P`,
      inverterConfiguration,
    },
    reactFlowData: {
      nodes,
      edges,
    },
    explanations: {
      inverterLogic: `Peak demand ${payload.peak_demand_w.toFixed(0)}W with a 25% margin requires ${inverterTargetW.toFixed(0)}W. This maps to ${inverterCount} x ${selectedInverter.label}${inverterConfiguration === "Split-Phase" ? " in split-phase for 240V output" : ""}.`,
      stringingLogic: `MPPT window is ${selectedInverter.mpptMinV}-${selectedInverter.mpptMaxV}V. With panel Voc ${panel.voc}V, a ${series}S string stays in range and ${parallel} parallel strings fit current limits.`,
      batteryLogic: `Battery bank target is ${batteryTargetKwh.toFixed(1)}kWh using DoD ${Math.round(dod * 100)}%. This results in ${batteryQty} batteries arranged as ${batterySeries}S${batteryParallel}P.`,
    },
    ogMetadata: {
      title: `${inverterKw.toFixed(0)}kW ${payload.system_type} System`,
      stats: [
        `${inverterKw.toFixed(1)}kW Inverter`,
        `${batteryTotalKwh.toFixed(1)}kWh ${batteryModel.chemistry}`,
        `${panelQty} Solar Panels`,
        `${arrayKw.toFixed(1)}kW Array`,
      ],
    },
  };
}