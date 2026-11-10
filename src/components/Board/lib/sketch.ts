import type { Stroke, StrokePoint } from "@/components/Board/types/board";

export type Tab = "write" | "sketch";
export type Tool = "type" | "pen" | "line" | "rect" | "ellipse" | "eraser";

export const COLORS = [
  { name: "Ink", value: "rgb(15 23 42)" },
  { name: "Coral", value: "rgb(244 114 90)" },
  { name: "Lagoon", value: "rgb(56 168 194)" },
  { name: "Mint", value: "rgb(120 200 160)" },
  { name: "Orchid", value: "rgb(178 130 220)" },
];
export const WIDTHS = [2, 4, 8, 16];
export const ERASER_RADIUS = 14;
export const HISTORY_LIMIT = 40;

export function pointsToPath(points: StrokePoint[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    const [x, y] = points[0];
    return `M ${x} ${y} L ${x + 0.01} ${y}`;
  }
  if (points.length === 2) {
    return `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]}`;
  }

  const mid = (a: StrokePoint, b: StrokePoint): StrokePoint => [
    (a[0] + b[0]) / 2,
    (a[1] + b[1]) / 2,
  ];
  const [sx, sy] = mid(points[0], points[1]);
  let d = `M ${points[0][0]} ${points[0][1]} L ${sx} ${sy}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [cx, cy] = points[i];
    const [mx, my] = mid(points[i], points[i + 1]);
    d += ` Q ${cx} ${cy} ${mx} ${my}`;
  }
  const last = points[points.length - 1];
  return `${d} L ${last[0]} ${last[1]}`;
}

export function distToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

export function hitsStroke(stroke: Stroke, x: number, y: number, radius: number): boolean {
  const pad = radius + stroke.width / 2;
  const kind = stroke.kind ?? "pen";
  const points = stroke.points;
  if (points.length === 0) return false;

  if (kind === "pen" || points.length < 2) {
    if (points.length === 1) {
      return Math.hypot(points[0][0] - x, points[0][1] - y) <= pad;
    }
    for (let i = 1; i < points.length; i++) {
      const [x1, y1] = points[i - 1];
      const [x2, y2] = points[i];
      if (distToSegment(x, y, x1, y1, x2, y2) <= pad) return true;
    }
    return false;
  }

  const [x1, y1] = points[0];
  const [x2, y2] = points[points.length - 1];

  if (kind === "line") return distToSegment(x, y, x1, y1, x2, y2) <= pad;

  if (kind === "rect") {
    const left = Math.min(x1, x2);
    const right = Math.max(x1, x2);
    const top = Math.min(y1, y2);
    const bottom = Math.max(y1, y2);
    const dx = Math.max(left - x, 0, x - right);
    const dy = Math.max(top - y, 0, y - bottom);
    const outside = Math.hypot(dx, dy);
    if (outside > 0) return outside <= pad;
    const inside = Math.min(x - left, right - x, y - top, bottom - y);
    return inside <= pad;
  }

  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  const rx = Math.max(Math.abs(x2 - x1) / 2, 0.001);
  const ry = Math.max(Math.abs(y2 - y1) / 2, 0.001);
  const nx = (x - cx) / rx;
  const ny = (y - cy) / ry;
  const len = Math.hypot(nx, ny);
  if (len === 0) return Math.min(rx, ry) <= pad;
  const ex = cx + (nx / len) * rx;
  const ey = cy + (ny / len) * ry;
  return Math.hypot(x - ex, y - ey) <= pad;
}

export function eraseAt(strokes: Stroke[], x: number, y: number, radius: number): Stroke[] {
  return strokes.filter((stroke) => !hitsStroke(stroke, x, y, radius + stroke.width / 2));
}

export function constrainEnd(
  tool: Tool,
  start: StrokePoint,
  point: StrokePoint,
  shift: boolean,
): StrokePoint {
  if (!shift || tool === "pen" || tool === "eraser") return point;
  const [x0, y0] = start;
  const [x, y] = point;
  if (tool === "line") {
    return Math.abs(x - x0) >= Math.abs(y - y0) ? [x, y0] : [x0, y];
  }
  const size = Math.max(Math.abs(x - x0), Math.abs(y - y0));
  const sx = x === x0 ? 1 : Math.sign(x - x0);
  const sy = y === y0 ? 1 : Math.sign(y - y0);
  return [x0 + sx * size, y0 + sy * size];
}

export function isDegenerate(stroke: Stroke): boolean {
  if ((stroke.kind ?? "pen") === "pen") return stroke.points.length === 0;
  if (stroke.points.length < 2) return true;
  const [x1, y1] = stroke.points[0];
  const [x2, y2] = stroke.points[stroke.points.length - 1];
  return x1 === x2 && y1 === y2;
}

export function cloneStrokes(snapshot: Stroke[]): Stroke[] {
  return snapshot.map((stroke) => ({
    ...stroke,
    points: stroke.points.map((point) => [...point] as StrokePoint),
  }));
}
