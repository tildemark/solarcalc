import { BomItem, SolarCalculationResult, SolarInputPayload } from "@/lib/calculator/types";

type InverterModel = {
  sku: string;
  label: string;
  topology: "Low-Frequency" | "High-Frequency";
  ratedW: number;
  surgeW: number;
  dcVoltage: number;
  mpptMinV: number;
  mpptMaxV: number;
  maxInputCurrentA: number;
  outputV: number;
};

type BatteryModel = {
  sku: string;
  label: string;
  chemistry: "LiFePO4" | "Lead Acid";
  nominalVoltage: 48;
  nominalKwh: number;
};

const inverters: InverterModel[] = [
                {
                  sku: "INV-1.2K-24-220",
                  label: "1.2kW High-Frequency Inverter (24V/220V)",
                  topology: "High-Frequency",
                  ratedW: 1200,
                  surgeW: 2400,
                  dcVoltage: 24,
                  mpptMinV: 20,
                  mpptMaxV: 110,
                  maxInputCurrentA: 60,
                  outputV: 220,
                },
              {
                sku: "INV-3K-48-SP",
                label: "3kW High-Frequency Split-Phase Inverter (48V/120/240V)",
                topology: "High-Frequency",
                ratedW: 3000,
                surgeW: 6000,
                dcVoltage: 48,
                mpptMinV: 80,
                mpptMaxV: 450,
                maxInputCurrentA: 15,
                outputV: 240,
              },
              {
                sku: "INV-5K-48-SP",
                label: "5kW High-Frequency Split-Phase Inverter (48V/120/240V)",
                topology: "High-Frequency",
                ratedW: 5000,
                surgeW: 10000,
                dcVoltage: 48,
                mpptMinV: 100,
                mpptMaxV: 480,
                maxInputCurrentA: 18,
                outputV: 240,
              },
              {
                sku: "INV-8K-48-SP",
                label: "8kW High-Frequency Split-Phase Inverter (48V/120/240V)",
                topology: "High-Frequency",
                ratedW: 8000,
                surgeW: 16000,
                dcVoltage: 48,
                mpptMinV: 120,
                mpptMaxV: 480,
                maxInputCurrentA: 26,
                outputV: 240,
              },
              {
                sku: "INV-12K-48-SP",
                label: "12kW High-Frequency Split-Phase Inverter (48V/120/240V)",
                topology: "High-Frequency",
                ratedW: 12000,
                surgeW: 24000,
                dcVoltage: 48,
                mpptMinV: 150,
                mpptMaxV: 500,
                maxInputCurrentA: 30,
                outputV: 240,
              },
            {
              sku: "INV-1.5K-24-220",
              label: "1.5kW High-Frequency Inverter (24V/220V)",
              topology: "High-Frequency",
              ratedW: 1500,
              surgeW: 3000,
              dcVoltage: 24,
              mpptMinV: 35,
              mpptMaxV: 120,
              maxInputCurrentA: 65,
              outputV: 220,
            },
            {
              sku: "INV-2.5K-24-220",
              label: "2.5kW High-Frequency Inverter (24V/220V)",
              topology: "High-Frequency",
              ratedW: 2500,
              surgeW: 5000,
              dcVoltage: 24,
              mpptMinV: 40,
              mpptMaxV: 140,
              maxInputCurrentA: 110,
              outputV: 220,
            },
            {
              sku: "INV-3K-24-220",
              label: "3kW High-Frequency Inverter (24V/220V)",
              topology: "High-Frequency",
              ratedW: 3000,
              surgeW: 6000,
              dcVoltage: 24,
              mpptMinV: 45,
              mpptMaxV: 150,
              maxInputCurrentA: 120,
              outputV: 220,
            },
          {
            sku: "INV-1.2K-12-220",
            label: "1.2kW High-Frequency Inverter (12V/220V)",
            topology: "High-Frequency",
            ratedW: 1200,
            surgeW: 2400,
            dcVoltage: 12,
            mpptMinV: 15,
            mpptMaxV: 100,
            maxInputCurrentA: 100,
            outputV: 220,
          },
          {
            sku: "INV-3K-48-220",
            label: "3kW High-Frequency Inverter (48V/220V)",
            topology: "High-Frequency",
            ratedW: 3000,
            surgeW: 6000,
            dcVoltage: 48,
            mpptMinV: 80,
            mpptMaxV: 450,
            maxInputCurrentA: 15,
            outputV: 220,
          },
        {
          sku: "INV-1K-24",
          label: "1kW High-Frequency Inverter (24V/220V)",
          topology: "High-Frequency",
          ratedW: 1000,
          surgeW: 2000,
          dcVoltage: 24,
          mpptMinV: 30,
          mpptMaxV: 120,
          maxInputCurrentA: 50,
          outputV: 220,
        },
        {
          sku: "INV-2K-24",
          label: "2kW High-Frequency Inverter (24V/220V)",
          topology: "High-Frequency",
          ratedW: 2000,
          surgeW: 4000,
          dcVoltage: 24,
          mpptMinV: 30,
          mpptMaxV: 120,
          maxInputCurrentA: 100,
          outputV: 220,
        },
        {
          sku: "INV-3K-24",
          label: "3kW High-Frequency Inverter (24V/220V)",
          topology: "High-Frequency",
          ratedW: 3000,
          surgeW: 6000,
          dcVoltage: 24,
          mpptMinV: 40,
          mpptMaxV: 140,
          maxInputCurrentA: 120,
          outputV: 220,
        },
        {
          sku: "INV-1K-48-220",
          label: "1kW High-Frequency Inverter (48V/220V)",
          topology: "High-Frequency",
          ratedW: 1000,
          surgeW: 2000,
          dcVoltage: 48,
          mpptMinV: 60,
          mpptMaxV: 400,
          maxInputCurrentA: 10,
          outputV: 220,
        },
        {
          sku: "INV-2K-48-220",
          label: "2kW High-Frequency Inverter (48V/220V)",
          topology: "High-Frequency",
          ratedW: 2000,
          surgeW: 4000,
          dcVoltage: 48,
          mpptMinV: 60,
          mpptMaxV: 400,
          maxInputCurrentA: 12,
          outputV: 220,
        },
      {
        sku: "INV-1.2K-12",
        label: "1.2kW High-Frequency Inverter",
        topology: "High-Frequency",
        ratedW: 1200,
        surgeW: 2400,
        dcVoltage: 12,
        mpptMinV: 15,
        mpptMaxV: 100,
        maxInputCurrentA: 100,
        outputV: 120,
      },
    {
      sku: "INV-1K-48",
      label: "1kW High-Frequency Inverter",
      topology: "High-Frequency",
      ratedW: 1000,
      surgeW: 2000,
      dcVoltage: 48,
      mpptMinV: 60,
      mpptMaxV: 400,
      maxInputCurrentA: 10,
      outputV: 120,
    },
    {
      sku: "INV-2K-48",
      label: "2kW High-Frequency Inverter",
      topology: "High-Frequency",
      ratedW: 2000,
      surgeW: 4000,
      dcVoltage: 48,
      mpptMinV: 60,
      mpptMaxV: 400,
      maxInputCurrentA: 12,
      outputV: 120,
    },
    {
      sku: "INV-3K-48",
      label: "3kW High-Frequency Inverter",
      topology: "High-Frequency",
      ratedW: 3000,
      surgeW: 6000,
      dcVoltage: 48,
      mpptMinV: 80,
      mpptMaxV: 450,
      maxInputCurrentA: 15,
      outputV: 120,
    },
    {
      sku: "INV-5K-48",
      label: "5kW High-Frequency Inverter",
      topology: "High-Frequency",
      ratedW: 5000,
      surgeW: 8000,
      dcVoltage: 48,
      mpptMinV: 100,
      mpptMaxV: 480,
      maxInputCurrentA: 18,
      outputV: 120,
    },
  {
    sku: "INV-8K-48",
    label: "8kW High-Frequency Hybrid Inverter",
    topology: "High-Frequency",
    ratedW: 8000,
    surgeW: 12000,
    dcVoltage: 48,
    mpptMinV: 120,
    mpptMaxV: 480,
    maxInputCurrentA: 26,
    outputV: 120,
  },
  {
    sku: "INV-12K-48",
    label: "12kW High-Frequency Hybrid Inverter",
    topology: "High-Frequency",
    ratedW: 12000,
    surgeW: 18000,
    dcVoltage: 48,
    mpptMinV: 150,
    mpptMaxV: 500,
    maxInputCurrentA: 30,
    outputV: 120,
  },
  {
    sku: "INV-6K-LF-48",
    label: "6kW Low-Frequency Inverter",
    topology: "Low-Frequency",
    ratedW: 6000,
    surgeW: 18000,
    dcVoltage: 48,
    mpptMinV: 120,
    mpptMaxV: 450,
    maxInputCurrentA: 22,
    outputV: 120,
  },
  {
    sku: "INV-10K-LF-48",
    label: "10kW Low-Frequency Inverter",
    topology: "Low-Frequency",
    ratedW: 10000,
    surgeW: 30000,
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

  const panelNumbers = [payload.panel_watts, payload.panel_voc, payload.panel_vmp, payload.panel_isc];
  if (panelNumbers.some((n) => !Number.isFinite(n) || n <= 0)) {
    throw new Error("Panel wattage and electrical values must be greater than zero.");
  }

  if (!Number.isFinite(payload.bifacial_gain_percent) || payload.bifacial_gain_percent < 0) {
    throw new Error("Bifacial gain percent must be zero or greater.");
  }

  if (payload.has_motor_loads) {
    if (!Number.isFinite(payload.motor_running_w) || payload.motor_running_w <= 0) {
      throw new Error("Motor running watts must be greater than zero when motor loads are enabled.");
    }

    if (
      !Number.isFinite(payload.motor_starting_multiplier) ||
      payload.motor_starting_multiplier < 1
    ) {
      throw new Error("Motor starting multiplier must be at least 1.");
    }
  }
}

export function calculateSolarSystem(payload: SolarInputPayload): SolarCalculationResult {
  validate(payload);

  const panel = {
    sku: `PANEL-${payload.panel_watts.toFixed(0)}${payload.panel_is_bifacial ? "-BF" : ""}`,
    label: `${payload.panel_watts.toFixed(0)}W ${payload.panel_is_bifacial ? "Bifacial" : "Mono"} Module`,
    watts: payload.panel_watts,
    voc: payload.panel_voc,
    vmp: payload.panel_vmp,
    isc: payload.panel_isc,
  };
  const bifacialGainFactor = payload.panel_is_bifacial
    ? 1 + payload.bifacial_gain_percent / 100
    : 1;
  const panelEffectiveWatts = panel.watts * bifacialGainFactor;

  const inverterTargetW = payload.peak_demand_w * 1.25;
  const surgeTargetW = payload.has_motor_loads
    ? payload.motor_running_w * payload.motor_starting_multiplier
    : 0;
  const finalRequiredW = Math.max(inverterTargetW, surgeTargetW);


  // Determine preferred topology
  const preferredTopology =
    payload.inverter_preference === "Auto"
      ? payload.has_motor_loads
        ? "Low-Frequency"
        : null
      : payload.inverter_preference;


  // Filter by output voltage range: treat 220V, 230V, 240V as equivalent (real-world range)
  let filteredInverters = inverters.filter((inv) => {
    if (payload.appliance_voltage === 220 || payload.appliance_voltage === 230 || payload.appliance_voltage === 240) {
      return [220, 230, 240].includes(inv.outputV);
    }
    return inv.outputV === payload.appliance_voltage;
  });
  // Then filter out split-phase inverters if user disables them
  if (payload.allow_split_phase === false) {
    filteredInverters = filteredInverters.filter((inv) => !inv.label.toLowerCase().includes("split-phase"));
  }



  let eligibleInverters =
    preferredTopology === null
      ? filteredInverters
      : filteredInverters.filter((inverter) => inverter.topology === preferredTopology);


  let inverterPool: typeof eligibleInverters = [];
  if (eligibleInverters.length > 0) {
    inverterPool = eligibleInverters;
  } else if (filteredInverters.length > 0) {
    inverterPool = filteredInverters;
  } else {
    inverterPool = [...inverters].sort((a, b) => a.ratedW - b.ratedW);
  }

  // --- FORCE: Always include the smallest inverter for small loads ---
  if (finalRequiredW <= 1000) {
    const smallest = [...inverters]
      .filter(inv => [220, 230, 240].includes(inv.outputV))
      .sort((a, b) => a.ratedW - b.ratedW)[0];
    if (smallest && !inverterPool.some(inv => inv.sku === smallest.sku)) {
      inverterPool.push(smallest);
    }
  }


  // If user disables split-phase, but 240V is required, explain fallback
  let splitPhaseExcluded = false;
  if (payload.allow_split_phase === false && payload.appliance_voltage === 240) {
    // Check if any 240V inverter remains
    const any240V = inverterPool.some((inv) => inv.outputV === 240);
    if (!any240V) {
      splitPhaseExcluded = true;
    }
  }

  const selectedOption = [...inverterPool]
    .map((model) => {
      const unitsByContinuous = Math.ceil(finalRequiredW / model.ratedW);
      const unitsBySurge = surgeTargetW > 0 ? Math.ceil(surgeTargetW / model.surgeW) : 1;
      const units = Math.max(1, unitsByContinuous, unitsBySurge);

      return {
        model,
        units,
      };
    })
    .sort((a, b) => a.units - b.units || a.model.ratedW - b.model.ratedW)[0];


  const selectedInverter = selectedOption.model;
  let inverterCount = selectedOption.units;

  let inverterConfiguration: "Single" | "Parallel" | "Split-Phase" = inverterCount > 1 ? "Parallel" : "Single";
  if (payload.appliance_voltage === 240 && inverterCount < 2) {
    inverterCount = 2;
    inverterConfiguration = selectedInverter.label.toLowerCase().includes("split-phase") ? "Split-Phase" : "Parallel";
  } else if (payload.appliance_voltage === 240 && inverterCount >= 2) {
    inverterConfiguration = selectedInverter.label.toLowerCase().includes("split-phase") ? "Split-Phase" : "Parallel";
  }

  const dod = payload.preferred_battery_chemistry === "LiFePO4" ? 0.8 : 0.5;
  const batteryTargetKwh = (payload.daily_consumption_kwh * payload.autonomy_days) / dod;
  const batteryModel = batteries.find((b) => b.chemistry === payload.preferred_battery_chemistry) ?? batteries[0];
  const batteryQty = Math.max(1, Math.ceil(batteryTargetKwh / batteryModel.nominalKwh));
  const batterySeries = Math.max(1, Math.round(selectedInverter.dcVoltage / batteryModel.nominalVoltage));
  const batteryParallel = Math.max(1, Math.ceil(batteryQty / batterySeries));

  const arrayTargetW = (payload.daily_consumption_kwh / payload.peak_sun_hours) * 1000 * 1.2;
  const panelQtyTarget = Math.max(1, Math.ceil(arrayTargetW / panelEffectiveWatts));

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
  const arrayKw = (panelEffectiveWatts * panelQty) / 1000;

  const bomItems: BomItem[] = [
    {
      category: "Inverter",
      sku: selectedInverter.sku,
      description: selectedInverter.label,
      quantity: inverterCount,
      specs: {
        isStacked: inverterCount > 1,
        configuration: inverterConfiguration,
        topology: selectedInverter.topology,
        surgeWattsPerUnit: selectedInverter.surgeW,
      } as Record<string, string | number | boolean>,
    },
    {
      category: "Solar Panel",
      sku: panel.sku,
      description: panel.label,
      quantity: panelQty,
      specs: {
        wattsPerPanel: panel.watts,
        effectiveWattsPerPanel: Number(panelEffectiveWatts.toFixed(2)),
        bifacial: payload.panel_is_bifacial,
        bifacialGainPercent: payload.panel_is_bifacial ? payload.bifacial_gain_percent : 0,
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
      inverterLogic: `Continuous requirement is ${inverterTargetW.toFixed(0)}W (peak demand x 1.25).${payload.has_motor_loads ? ` Motor starting surge is ${surgeTargetW.toFixed(0)}W (${payload.motor_running_w.toFixed(0)}W x ${payload.motor_starting_multiplier.toFixed(1)}).` : ""} The inverter bank is sized to ${finalRequiredW.toFixed(0)}W using ${selectedInverter.topology.toLowerCase()} topology, resulting in ${inverterCount} x ${selectedInverter.label}${inverterConfiguration === "Split-Phase" ? " in split-phase for 240V output" : ""}.`,
      stringingLogic: `MPPT window is ${selectedInverter.mpptMinV}-${selectedInverter.mpptMaxV}V. With panel Voc ${panel.voc}V, a ${series}S string stays in range and ${parallel} parallel strings fit current limits.${payload.panel_is_bifacial ? ` Bifacial yield factor of ${payload.bifacial_gain_percent.toFixed(1)}% is applied to energy sizing.` : ""}`,
      batteryLogic: `Battery bank target is ${batteryTargetKwh.toFixed(1)}kWh using DoD ${Math.round(dod * 100)}%. This results in ${batteryQty} batteries arranged as ${batterySeries}S${batteryParallel}P.`,
    },
    computations: {
      assumptions: {
        inverterSafetyFactor: 1.25,
        arrayLossFactor: 1.2,
        continuousLoadFactor: 1.25,
        batteryDoD: dod,
        motorStartingMultiplier: payload.has_motor_loads ? payload.motor_starting_multiplier : 1,
      },
      inverter: {
        formula: payload.has_motor_loads
          ? `max(${payload.peak_demand_w} * 1.25, ${payload.motor_running_w} * ${payload.motor_starting_multiplier})`
          : `${payload.peak_demand_w} * 1.25`,
        targetW: Number(inverterTargetW.toFixed(2)),
        surgeTargetW: Number(surgeTargetW.toFixed(2)),
        finalRequiredW: Number(finalRequiredW.toFixed(2)),
        selectedModel: selectedInverter.label,
        topology: selectedInverter.topology,
        modelSurgeW: selectedInverter.surgeW,
        modelRatedW: selectedInverter.ratedW,
        unitCount: inverterCount,
        configuration: inverterConfiguration,
      },
      battery: {
        formula: `(${payload.daily_consumption_kwh} * ${payload.autonomy_days}) / ${dod}`,
        targetKwh: Number(batteryTargetKwh.toFixed(2)),
        selectedModel: batteryModel.label,
        modelKwh: batteryModel.nominalKwh,
        quantity: batteryQty,
        series: batterySeries,
        parallel: batteryParallel,
      },
      solarArray: {
        formula: `(${payload.daily_consumption_kwh} / ${payload.peak_sun_hours}) * 1000 * 1.2`,
        targetW: Number(arrayTargetW.toFixed(2)),
        panelWatts: panel.watts,
        panelEffectiveWatts: Number(panelEffectiveWatts.toFixed(2)),
        panelIsBifacial: payload.panel_is_bifacial,
        bifacialGainPercent: payload.panel_is_bifacial ? payload.bifacial_gain_percent : 0,
        targetPanelCount: panelQtyTarget,
        selectedSeries: series,
        selectedParallel: parallel,
        maxParallelByCurrent,
        finalPanelCount: panelQty,
        mpptSeriesBounds: {
          min: minSeries,
          max: maxSeries,
        },
      },
      protection: {
        pvCurrentA: Number(pvCurrentA.toFixed(2)),
        dcBreakerA,
        acCurrentA: Number(acCurrentA.toFixed(2)),
        acBreakerA,
      },
    },
    ogMetadata: {
      title: `${inverterKw.toFixed(0)}kW ${payload.system_type} System`,
      stats: [
        `${inverterKw.toFixed(1)}kW Inverter`,
        `${batteryTotalKwh.toFixed(1)}kWh ${batteryModel.chemistry}`,
        `${panelQty} x ${panel.watts.toFixed(0)}W${payload.panel_is_bifacial ? " Bifacial" : ""} Panels`,
        `${arrayKw.toFixed(1)}kW ${payload.panel_is_bifacial ? "Effective Array" : "Array"}`,
      ],
    },
  };
}