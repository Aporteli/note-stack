import { snap } from "@/components/diagram/lib/snap";
import type { DiagramShape } from "@/components/diagram/types";

export function movedShape(shape: DiagramShape, dx: number, dy: number): DiagramShape {
  return { ...shape, x: snap(shape.x + dx), y: snap(shape.y + dy) };
}
