import type { Point, View } from "@/components/diagram/types";

export function worldPoint(clientX: number, clientY: number, rect: DOMRect, view: View): Point {
  return {
    x: (clientX - rect.left - view.x) / view.zoom,
    y: (clientY - rect.top - view.y) / view.zoom,
  };
}
