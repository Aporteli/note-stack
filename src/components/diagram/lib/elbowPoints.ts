import { leavePoint } from "@/components/diagram/lib/leavePoint";
import { sidePoint } from "@/components/diagram/lib/sidePoint";
import type { DiagramShape, Point, Side } from "@/components/diagram/types";

const OUTSET = 24;

export function elbowPoints(
  from: DiagramShape,
  fromSide: Side,
  to: DiagramShape,
  toSide: Side,
): Point[] {
  const start = sidePoint(from, fromSide);
  const end = sidePoint(to, toSide);
  const startOut = leavePoint(start, fromSide, OUTSET);
  const endOut = leavePoint(end, toSide, OUTSET);
  const alongX = fromSide === "left" || fromSide === "right";
  const bend = alongX ? { x: endOut.x, y: startOut.y } : { x: startOut.x, y: endOut.y };
  return [start, startOut, bend, endOut, end];
}
