import type { DiagramDocument, DiagramShape, Selection } from "@/components/diagram/types";

export function primaryShape(document: DiagramDocument, selected: Selection): DiagramShape | null {
  const id = selected.shapeIds[selected.shapeIds.length - 1];
  if (!id) return null;
  return document.shapes.find((shape) => shape.id === id) ?? null;
}
