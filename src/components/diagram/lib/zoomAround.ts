import { clampZoom } from "@/components/diagram/lib/clampZoom";
import type { View } from "@/components/diagram/types";

export function zoomAround(view: View, nextZoom: number, rect: DOMRect): View {
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const worldX = (centerX - view.x) / view.zoom;
  const worldY = (centerY - view.y) / view.zoom;
  const zoom = clampZoom(nextZoom);
  return { zoom, x: centerX - worldX * zoom, y: centerY - worldY * zoom };
}
