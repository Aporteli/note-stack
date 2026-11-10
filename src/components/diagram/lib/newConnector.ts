import { newId } from "@/components/diagram/lib/newId";
import type { DiagramConnector, Side } from "@/components/diagram/types";

export function newConnector(
  fromId: string,
  fromSide: Side,
  toId: string,
  toSide: Side,
): DiagramConnector | null {
  if (!fromId || !toId || fromId === toId) return null;
  return {
    id: newId(),
    fromId,
    fromSide,
    toId,
    toSide,
    route: "elbow",
    arrow: "end",
    dashed: false,
    weight: "medium",
  };
}
