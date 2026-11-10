import type { DiagramShape, Side } from "@/components/diagram/types";

export function nearestSide(shape: DiagramShape, x: number, y: number): Side {
  const dx = (x - (shape.x + shape.w / 2)) / (shape.w / 2 || 1);
  const dy = (y - (shape.y + shape.h / 2)) / (shape.h / 2 || 1);
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "bottom" : "top";
}
