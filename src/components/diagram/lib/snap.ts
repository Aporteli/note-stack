import { DIAGRAM_LIMITS } from "@/components/diagram/limits";

export function snap(value: number): number {
  return Math.round(value / DIAGRAM_LIMITS.grid) * DIAGRAM_LIMITS.grid;
}
