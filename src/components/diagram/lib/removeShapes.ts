import type { DiagramDocument } from "@/components/diagram/types";

export function removeShapes(document: DiagramDocument, ids: string[]): DiagramDocument {
  const idSet = new Set(ids);
  return {
    shapes: document.shapes.filter((shape) => !idSet.has(shape.id)),
    connectors: document.connectors.filter(
      (connector) => !idSet.has(connector.fromId) && !idSet.has(connector.toId),
    ),
  };
}
