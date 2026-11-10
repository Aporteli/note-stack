import type { Selection } from "@/components/diagram/types";

export function selectConnector(id: string): Selection {
  return { shapeIds: [], connectorId: id };
}
