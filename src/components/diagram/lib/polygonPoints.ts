import type { DiagramShape } from "@/components/diagram/types";

export function polygonPoints(shape: DiagramShape): string | null {
  const { x, y, w, h } = shape;
  const midX = x + w / 2;
  const midY = y + h / 2;
  if (shape.kind === "diamond") return `${midX},${y} ${x + w},${midY} ${midX},${y + h} ${x},${midY}`;
  if (shape.kind === "hex") {
    const inset = w * 0.22;
    return `${x + inset},${y} ${x + w - inset},${y} ${x + w},${midY} ${x + w - inset},${y + h} ${x + inset},${y + h} ${x},${midY}`;
  }
  if (shape.kind === "slant") {
    const skew = Math.min(28, w * 0.2);
    return `${x + skew},${y} ${x + w},${y} ${x + w - skew},${y + h} ${x},${y + h}`;
  }
  return null;
}
