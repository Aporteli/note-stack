import type { Box } from "@/components/Board/lib/arrow/sidePoint";
import type { ArrowSide } from "@/components/Board/types/arrow";

export function nearestSide(box: Box, point: { x: number; y: number }): ArrowSide {
  const dx = (point.x - (box.x + box.w / 2)) / (box.w || 1);
  const dy = (point.y - (box.y + box.h / 2)) / (box.h || 1);
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "bottom" : "top";
}
