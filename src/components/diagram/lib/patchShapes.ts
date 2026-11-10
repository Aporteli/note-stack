import type { DiagramShape } from "@/components/diagram/types";

export function patchShapes(
  shapes: DiagramShape[],
  ids: string[],
  patch: Partial<Omit<DiagramShape, "id" | "kind">>,
): DiagramShape[] {
  const idSet = new Set(ids);
  return shapes.map((shape) => (idSet.has(shape.id) ? { ...shape, ...patch } : shape));
}
