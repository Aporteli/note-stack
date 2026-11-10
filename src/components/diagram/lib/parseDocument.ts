import { emptyDocument } from "@/components/diagram/lib/emptyDocument";
import { parseConnector } from "@/components/diagram/lib/parseConnector";
import { parseShape } from "@/components/diagram/lib/parseShape";
import { readJson } from "@/components/diagram/lib/readJson";
import { DIAGRAM_LIMITS } from "@/components/diagram/limits";
import type { DiagramConnector, DiagramDocument, DiagramShape } from "@/components/diagram/types";

export function parseDocument(input: unknown): DiagramDocument {
  const value = typeof input === "string" ? readJson(input) : input;
  if (!value || typeof value !== "object") return emptyDocument();
  const row = value as Record<string, unknown>;
  const shapes: DiagramShape[] = [];
  const seen = new Set<string>();
  if (Array.isArray(row.shapes)) {
    for (const item of row.shapes) {
      if (shapes.length >= DIAGRAM_LIMITS.shapes) break;
      const shape = parseShape(item);
      if (!shape || seen.has(shape.id)) continue;
      seen.add(shape.id);
      shapes.push(shape);
    }
  }
  const connectors: DiagramConnector[] = [];
  const connectorIds = new Set<string>();
  if (Array.isArray(row.connectors)) {
    for (const item of row.connectors) {
      if (connectors.length >= DIAGRAM_LIMITS.connectors) break;
      const connector = parseConnector(item);
      if (!connector || connectorIds.has(connector.id)) continue;
      if (!seen.has(connector.fromId) || !seen.has(connector.toId)) continue;
      if (connector.fromId === connector.toId) continue;
      connectorIds.add(connector.id);
      connectors.push(connector);
    }
  }
  return { shapes, connectors };
}
