import type { LineWeight } from "@/components/diagram/types";

export function strokePaint(weight: LineWeight): number {
  if (weight === "thin") return 1.25;
  if (weight === "thick") return 3.5;
  return 2.25;
}
