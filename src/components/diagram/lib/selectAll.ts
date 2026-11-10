import type { DiagramShape, Selection } from "@/components/diagram/types";

export function selectAll(shapes: DiagramShape[]): Selection {
  return { shapeIds: shapes.map((shape) => shape.id), connectorId: null };
}
