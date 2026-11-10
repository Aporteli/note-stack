import { clampZoom } from "@/components/diagram/lib/clampZoom";
import { worldPoint } from "@/components/diagram/lib/worldPoint";
import type { View } from "@/components/diagram/types";

export function wheelView(view: View, event: WheelEvent, rect: DOMRect): View {
  if (event.ctrlKey || event.metaKey) {
    const zoom = clampZoom(view.zoom * (event.deltaY < 0 ? 1.08 : 1 / 1.08));
    const world = worldPoint(event.clientX, event.clientY, rect, view);
    return {
      zoom,
      x: event.clientX - rect.left - world.x * zoom,
      y: event.clientY - rect.top - world.y * zoom,
    };
  }
  return { ...view, x: view.x - event.deltaX, y: view.y - event.deltaY };
}
