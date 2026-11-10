import { isSide } from "@/components/diagram/lib/isSide";
import type { Side } from "@/components/diagram/types";

export function shapeTarget(element: Element | null): { id: string; side: Side | null } | null {
  const node = element?.closest("[data-shape-id]");
  if (!node) return null;
  const id = node.getAttribute("data-shape-id");
  if (!id) return null;
  const side = element?.closest("[data-side]")?.getAttribute("data-side");
  return { id, side: isSide(side) ? side : null };
}
