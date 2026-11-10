import type { DiagramShape, Side } from "@/components/diagram/types";

export function sidePoint(shape: DiagramShape, side: Side): { x: number; y: number } {
  const midX = shape.x + shape.w / 2;
  const midY = shape.y + shape.h / 2;
  if (side === "top") return { x: midX, y: shape.y };
  if (side === "bottom") return { x: midX, y: shape.y + shape.h };
  if (side === "left") return { x: shape.x, y: midY };
  return { x: shape.x + shape.w, y: midY };
}
