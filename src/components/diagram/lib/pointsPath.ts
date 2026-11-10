import type { Point } from "@/components/diagram/types";

export function pointsPath(points: Point[]): string {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");
}
