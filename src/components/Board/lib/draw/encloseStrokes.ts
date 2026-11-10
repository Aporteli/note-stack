import type { Stroke, StrokePoint } from "@/components/Board/types/board";

type Box = { x: number; y: number; w: number; h: number };

export function encloseStrokes(box: Box, strokes: Stroke[]) {
  let minX = 0;
  let minY = 0;
  let maxX = box.w;
  let maxY = box.h;
  for (const stroke of strokes) {
    for (const [px, py] of stroke.points) {
      if (px < minX) minX = px;
      if (py < minY) minY = py;
      if (px > maxX) maxX = px;
      if (py > maxY) maxY = py;
    }
  }
  if (minX === 0 && minY === 0 && maxX === box.w && maxY === box.h) {
    return { ...box, strokes };
  }
  return {
    x: box.x + minX,
    y: box.y + minY,
    w: Math.max(1, maxX - minX),
    h: Math.max(1, maxY - minY),
    strokes: strokes.map((stroke) => ({
      ...stroke,
      points: stroke.points.map(([px, py]) => [px - minX, py - minY] as StrokePoint),
    })),
  };
}
