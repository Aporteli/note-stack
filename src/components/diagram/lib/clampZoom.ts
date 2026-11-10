import { DIAGRAM_LIMITS } from "@/components/diagram/limits";

export function clampZoom(zoom: number): number {
  return Math.min(DIAGRAM_LIMITS.maxZoom, Math.max(DIAGRAM_LIMITS.minZoom, zoom));
}
