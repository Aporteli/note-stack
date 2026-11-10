import { DIAGRAM_LIMITS } from "@/components/diagram/limits";
import { snap } from "@/components/diagram/lib/snap";
import type { Box, Corner } from "@/components/diagram/types";

export function resizedBox(box: Box, corner: Corner, x: number, y: number): Box {
  const snappedX = snap(x);
  const snappedY = snap(y);
  let left = box.x;
  let top = box.y;
  let right = box.x + box.w;
  let bottom = box.y + box.h;
  if (corner === "nw" || corner === "sw") left = snappedX;
  else right = snappedX;
  if (corner === "nw" || corner === "ne") top = snappedY;
  else bottom = snappedY;
  if (right - left < DIAGRAM_LIMITS.minSize) {
    if (corner === "nw" || corner === "sw") left = right - DIAGRAM_LIMITS.minSize;
    else right = left + DIAGRAM_LIMITS.minSize;
  }
  if (bottom - top < DIAGRAM_LIMITS.minSize) {
    if (corner === "nw" || corner === "ne") top = bottom - DIAGRAM_LIMITS.minSize;
    else bottom = top + DIAGRAM_LIMITS.minSize;
  }
  return { x: left, y: top, w: right - left, h: bottom - top };
}
