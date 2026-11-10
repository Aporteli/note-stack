import type { Selection } from "@/components/diagram/types";

export function selectShape(id: string, shift: boolean, current: Selection): Selection {
  if (!shift || current.connectorId) return { shapeIds: [id], connectorId: null };
  if (current.shapeIds.includes(id)) {
    return { shapeIds: current.shapeIds.filter((item) => item !== id), connectorId: null };
  }
  return { shapeIds: [...current.shapeIds, id], connectorId: null };
}
