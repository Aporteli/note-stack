import type { DiagramShape } from "@/components/diagram/types";

export function removeShape(shapes: DiagramShape[], id: string): DiagramShape[] {
  return shapes.filter((shape) => shape.id !== id);
}
