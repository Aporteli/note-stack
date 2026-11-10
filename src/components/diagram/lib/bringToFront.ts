import type { DiagramShape } from "@/components/diagram/types";

export function bringToFront(shapes: DiagramShape[], id: string): DiagramShape[] {
  const index = shapes.findIndex((shape) => shape.id === id);
  if (index < 0 || index === shapes.length - 1) return shapes;
  const next = shapes.slice();
  const [shape] = next.splice(index, 1);
  next.push(shape);
  return next;
}
