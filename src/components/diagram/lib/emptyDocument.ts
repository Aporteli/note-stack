import type { DiagramDocument } from "@/components/diagram/types";

export function emptyDocument(): DiagramDocument {
  return { shapes: [], connectors: [] };
}
