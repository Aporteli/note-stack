import type { ArrowSide } from "@/components/Board/types/arrow";

export type Box = { x: number; y: number; w: number; h: number };

export function sidePoint(box: Box, side: ArrowSide) {
  if (side === "top") return { x: box.x + box.w / 2, y: box.y };
  if (side === "right") return { x: box.x + box.w, y: box.y + box.h / 2 };
  if (side === "bottom") return { x: box.x + box.w / 2, y: box.y + box.h };
  return { x: box.x, y: box.y + box.h / 2 };
}
