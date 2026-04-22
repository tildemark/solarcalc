"use client";

import "@xyflow/react/dist/style.css";
import { Background, Controls, Edge, Node, ReactFlow } from "@xyflow/react";
import type { SolarCalculationResult } from "@/lib/calculator/types";

type SystemDiagramProps = {
  data: SolarCalculationResult["reactFlowData"];
};

function toLabel(data: Record<string, string | number | boolean | undefined>) {
  const rows = Object.entries(data)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${String(value)}`);
  return rows.join("\n");
}

export function SystemDiagram({ data }: SystemDiagramProps) {
  const nodes: Node[] = data.nodes.map((node) => ({
    id: node.id,
    type: "default",
    position: node.position,
    data: {
      label: toLabel(node.data),
    },
    draggable: false,
    selectable: false,
  }));

  const edges: Edge[] = data.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: true,
  }));

  return (
    <div className="diagram-shell" aria-label="System wiring diagram preview">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}