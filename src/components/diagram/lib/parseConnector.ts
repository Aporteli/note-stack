import { isSide } from "@/components/diagram/lib/isSide";
import { oneOf } from "@/components/diagram/lib/oneOf";
import { readFlag } from "@/components/diagram/lib/readFlag";
import { ARROWS, LINE_WEIGHTS, ROUTES, type DiagramConnector } from "@/components/diagram/types";

export function parseConnector(value: unknown): DiagramConnector | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || row.id.length === 0 || row.id.length > 80) return null;
  if (typeof row.fromId !== "string" || typeof row.toId !== "string") return null;
  if (typeof row.fromSide !== "string" || !isSide(row.fromSide)) return null;
  if (typeof row.toSide !== "string" || !isSide(row.toSide)) return null;
  return {
    id: row.id,
    fromId: row.fromId,
    fromSide: row.fromSide,
    toId: row.toId,
    toSide: row.toSide,
    route: oneOf(row.route, ROUTES, "elbow"),
    arrow: oneOf(row.arrow, ARROWS, "end"),
    dashed: readFlag(row.dashed),
    weight: oneOf(row.weight, LINE_WEIGHTS, "medium"),
  };
}
