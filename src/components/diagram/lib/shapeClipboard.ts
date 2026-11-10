import { DIAGRAM_LIMITS } from "@/components/diagram/limits";
import { newId } from "@/components/diagram/lib/newId";
import type { DiagramShape } from "@/components/diagram/types";

let copied: DiagramShape[] = [];
let pastes = 0;

export function copyShapes(shapes: DiagramShape[]) {
  copied = shapes.map((shape) => ({ ...shape }));
  pastes = 0;
}

export function pastedShapes(): DiagramShape[] {
  if (!copied.length) return [];
  pastes += 1;
  const delta = DIAGRAM_LIMITS.grid * pastes;
  return copied.map((shape) => ({ ...shape, id: newId(), x: shape.x + delta, y: shape.y + delta }));
}
