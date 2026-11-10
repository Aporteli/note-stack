import type { PointerEvent } from "react";

export function stopDrag(event: PointerEvent) {
  event.stopPropagation();
}
