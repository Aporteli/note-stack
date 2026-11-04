import type { Stroke, StrokePoint } from "@/components/Board/types/board";

export type FreehandTool = "pencil" | "eraser";

export const FREEHAND_COLORS = [
  { name: "Ink", value: "rgb(15 23 42)" },
  { name: "Coral", value: "rgb(244 114 90)" },
  { name: "Lagoon", value: "rgb(56 168 194)" },
  { name: "Mint", value: "rgb(120 200 160)" },
  { name: "Orchid", value: "rgb(178 130 220)" },
];

export const FREEHAND_WIDTHS = [2, 4, 8, 16];
export const FREEHAND_ERASER_RADIUS = 14;

/** Drop any stroke whose any point is within the eraser radius. */
export function eraseFreehand(
  strokes: Stroke[],
  x: number,
  y: number,
  radius: number,
): Stroke[] {
  const radius2 = radius * radius;
  return strokes.filter((stroke) => {
    for (const [px, py] of stroke.points) {
      const dx = px - x;
      const dy = py - y;
      if (dx * dx + dy * dy < radius2) return false;
    }
    return true;
  });
}

export function fitFreehand(strokes: Stroke[]): {
  bounds: { x: number; y: number; w: number; h: number };
  strokes: Stroke[];
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxW = 0;

  for (const stroke of strokes) {
    maxW = Math.max(maxW, stroke.width);
    for (const [x, y] of stroke.points) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  const pad = maxW;
  minX -= pad;
  minY -= pad;
  maxX += pad;
  maxY += pad;

  const w = Math.max(1, maxX - minX);
  const h = Math.max(1, maxY - minY);
  const normalized: Stroke[] = strokes.map((stroke) => ({
    ...stroke,
    points: stroke.points.map(([x, y]) => [x - minX, y - minY] as StrokePoint),
  }));

  return { bounds: { x: minX, y: minY, w, h }, strokes: normalized };
}
