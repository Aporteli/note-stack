import { snap } from "@/components/diagram/lib/snap";
import type { AlignMode, DiagramShape } from "@/components/diagram/types";

export function alignShapes(shapes: DiagramShape[], ids: string[], mode: AlignMode): DiagramShape[] {
  const picked = shapes.filter((shape) => ids.includes(shape.id));
  if (picked.length < 2) return shapes;
  const left = Math.min(...picked.map((shape) => shape.x));
  const right = Math.max(...picked.map((shape) => shape.x + shape.w));
  const top = Math.min(...picked.map((shape) => shape.y));
  const bottom = Math.max(...picked.map((shape) => shape.y + shape.h));
  const midX = (left + right) / 2;
  const midY = (top + bottom) / 2;
  return shapes.map((shape) => {
    if (!ids.includes(shape.id)) return shape;
    if (mode === "left") return { ...shape, x: snap(left) };
    if (mode === "right") return { ...shape, x: snap(right - shape.w) };
    if (mode === "center") return { ...shape, x: snap(midX - shape.w / 2) };
    if (mode === "top") return { ...shape, y: snap(top) };
    if (mode === "bottom") return { ...shape, y: snap(bottom - shape.h) };
    return { ...shape, y: snap(midY - shape.h / 2) };
  });
}
