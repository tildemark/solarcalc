export type SystemType = "Off-Grid" | "Grid-Tied" | "Hybrid";
export type BatteryChemistry = "LiFePO4" | "Lead Acid";

export type SolarInputPayload = {
  daily_consumption_kwh: number;
  peak_demand_w: number;
  system_type: SystemType;
  peak_sun_hours: number;
  autonomy_days: number;
  appliance_voltage: 120 | 240;
  preferred_battery_chemistry: BatteryChemistry;
  save_project: boolean;
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

export type SolarApiResponse = {
  result: SolarCalculationResult;
  save: SaveResult;
};