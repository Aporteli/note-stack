import { parseDocument } from "@/components/diagram/lib/parseDocument";
import type { DiagramDocument } from "@/components/diagram/types";

export function acceptDocument(input: unknown): DiagramDocument | null {
  if (!input || typeof input !== "object") return null;
  const row = input as Record<string, unknown>;
  if (!Array.isArray(row.shapes) || !Array.isArray(row.connectors)) return null;
  const parsed = parseDocument(input);
  if (parsed.shapes.length !== row.shapes.length) return null;
  if (parsed.connectors.length !== row.connectors.length) return null;
  return parsed;
}
