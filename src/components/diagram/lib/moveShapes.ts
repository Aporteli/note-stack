import { movedShape } from "@/components/diagram/lib/movedShape";
import type { DiagramShape } from "@/components/diagram/types";

export function moveShapes(
  shapes: DiagramShape[],
  origins: DiagramShape[],
  dx: number,
  dy: number,
): DiagramShape[] {
  const nextById = new Map(origins.map((shape) => [shape.id, movedShape(shape, dx, dy)]));
  let changed = false;
  const next = shapes.map((shape) => {
    const moved = nextById.get(shape.id);
    if (!moved) return shape;
    if (moved.x !== shape.x || moved.y !== shape.y) changed = true;
    return moved;
  });
  return changed ? next : shapes;
}
