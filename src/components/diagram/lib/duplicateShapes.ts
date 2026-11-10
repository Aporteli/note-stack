import { newId } from "@/components/diagram/lib/newId";
import type { DiagramShape } from "@/components/diagram/types";

export function duplicateShapes(shapes: DiagramShape[], ids: string[]): { shapes: DiagramShape[]; ids: string[] } {
  const copies = shapes
    .filter((shape) => ids.includes(shape.id))
    .map((shape) => ({ ...shape, id: newId(), x: shape.x + 16, y: shape.y + 16 }));
  return { shapes: [...shapes, ...copies], ids: copies.map((shape) => shape.id) };
}
