import type { DiagramShape } from "@/components/diagram/types";

export function replaceShape(shapes: DiagramShape[], next: DiagramShape): DiagramShape[] {
  return shapes.map((shape) => (shape.id === next.id ? next : shape));
}
