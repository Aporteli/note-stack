import type { DiagramShape } from "@/components/diagram/types";

export function sendToBack(shapes: DiagramShape[], ids: string[]): DiagramShape[] {
  const idSet = new Set(ids);
  const rest: DiagramShape[] = [];
  const picked: DiagramShape[] = [];
  for (const shape of shapes) {
    if (idSet.has(shape.id)) picked.push(shape);
    else rest.push(shape);
  }
  if (picked.length === 0) return shapes;
  const next = [...picked, ...rest];
  if (next.every((shape, index) => shape === shapes[index])) return shapes;
  return next;
}
