export type SystemType = "Off-Grid" | "Grid-Tied" | "Hybrid";
export type BatteryChemistry = "LiFePO4" | "Lead Acid";
export type InverterPreference = "Auto" | "Low-Frequency" | "High-Frequency";
export type PanelPreset = "450W" | "650W" | "730W" | "Custom";

export type SolarInputPayload = {
  daily_consumption_kwh: number;
  peak_demand_w: number;
  system_type: SystemType;
  peak_sun_hours: number;
  autonomy_days: number;
  appliance_voltage: 120 | 240;
  panel_preset: PanelPreset;
  panel_watts: number;
  panel_voc: number;
  panel_vmp: number;
  panel_isc: number;
  panel_is_bifacial: boolean;
  bifacial_gain_percent: number;
  has_motor_loads: boolean;
  motor_running_w: number;
  motor_starting_multiplier: number;
  inverter_preference: InverterPreference;
  preferred_battery_chemistry: BatteryChemistry;
  save_project: boolean;
  monthly_bill_php?: string;
  cost_per_kwh_php?: string;
};

export type BomItem = {
  category: string;
  sku: string;
  description: string;
  quantity: number;
  specs?: Record<string, string | number | boolean | undefined>;
};

export type ReactFlowNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, string | number | boolean | undefined>;
};

export type ReactFlowEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
};

export type SolarComputations = {
  assumptions: {
    inverterSafetyFactor: number;
    arrayLossFactor: number;
    continuousLoadFactor: number;
    batteryDoD: number;
    motorStartingMultiplier: number;
  };
  inverter: {
    formula: string;
    targetW: number;
    surgeTargetW: number;
    finalRequiredW: number;
    selectedModel: string;
    topology: "Low-Frequency" | "High-Frequency";
    modelSurgeW: number;
    modelRatedW: number;
    unitCount: number;
    configuration: "Single" | "Parallel" | "Split-Phase";
  };
  battery: {
    formula: string;
    targetKwh: number;
    selectedModel: string;
    modelKwh: number;
    quantity: number;
    series: number;
    parallel: number;
  };
  solarArray: {
    formula: string;
    targetW: number;
    panelWatts: number;
    panelEffectiveWatts: number;
    panelIsBifacial: boolean;
    bifacialGainPercent: number;
    targetPanelCount: number;
    selectedSeries: number;
    selectedParallel: number;
    maxParallelByCurrent: number;
    finalPanelCount: number;
    mpptSeriesBounds: {
      min: number;
      max: number;
    };
  };
  protection: {
    pvCurrentA: number;
    dcBreakerA: number;
    acCurrentA: number;
    acBreakerA: number;
  };
};

export type SolarCalculationResult = {
  bom: {
    items: BomItem[];
  };
  configuration: {
    panelStringing: string;
    batteryConfiguration: string;
    inverterConfiguration: "Single" | "Parallel" | "Split-Phase";
  };
  reactFlowData: {
    nodes: ReactFlowNode[];
    edges: ReactFlowEdge[];
  };
  explanations: {
    inverterLogic: string;
    stringingLogic: string;
    batteryLogic: string;
  };
  computations: SolarComputations;
  ogMetadata: {
    title: string;
    stats: string[];
  };
};

export type SaveResult = {
  attempted: boolean;
  saved: boolean;
  reason?: string;
  projectId?: string;
  shareUrl?: string;
};

export type ShareResult = {
  attempted: boolean;
  saved: boolean;
  reason?: string;
  projectId?: string;
  shareUrl?: string;
};

export type SolarApiResponse = {
  result: SolarCalculationResult;
  save: SaveResult;
  share: ShareResult;
};