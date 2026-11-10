import type { DiagramShape } from "@/components/diagram/types";

export function patchShape(
  shapes: DiagramShape[],
  id: string,
  patch: Partial<Omit<DiagramShape, "id" | "kind">>,
): DiagramShape[] {
  return shapes.map((shape) => (shape.id === id ? { ...shape, ...patch } : shape));
}
