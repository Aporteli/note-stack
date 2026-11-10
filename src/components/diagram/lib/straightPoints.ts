import { sidePoint } from "@/components/diagram/lib/sidePoint";
import type { DiagramShape, Point, Side } from "@/components/diagram/types";

export function straightPoints(from: DiagramShape, fromSide: Side, to: DiagramShape, toSide: Side): Point[] {
  return [sidePoint(from, fromSide), sidePoint(to, toSide)];
}
