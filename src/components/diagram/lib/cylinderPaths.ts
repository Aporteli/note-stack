import type { DiagramShape } from "@/components/diagram/types";

export function cylinderPaths(shape: DiagramShape): { body: string; cap: string } {
  const { x, y, w, h } = shape;
  const ry = Math.min(16, h * 0.16);
  const body = `M ${x} ${y + ry} A ${w / 2} ${ry} 0 0 1 ${x + w} ${y + ry} L ${x + w} ${y + h - ry} A ${w / 2} ${ry} 0 0 1 ${x} ${y + h - ry} Z`;
  const cap = `M ${x} ${y + ry} A ${w / 2} ${ry} 0 0 0 ${x + w} ${y + ry}`;
  return { body, cap };
}
