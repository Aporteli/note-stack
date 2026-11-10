import { leavePoint } from "@/components/diagram/lib/leavePoint";
import { sidePoint } from "@/components/diagram/lib/sidePoint";
import type { DiagramShape, Side } from "@/components/diagram/types";

export function curvePath(from: DiagramShape, fromSide: Side, to: DiagramShape, toSide: Side): string {
  const start = sidePoint(from, fromSide);
  const end = sidePoint(to, toSide);
  const controlStart = leavePoint(start, fromSide, 72);
  const controlEnd = leavePoint(end, toSide, 72);
  return `M${start.x} ${start.y} C${controlStart.x} ${controlStart.y} ${controlEnd.x} ${controlEnd.y} ${end.x} ${end.y}`;
}
