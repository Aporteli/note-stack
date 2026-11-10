import type { Selection } from "@/components/diagram/types";

export function emptySelection(): Selection {
  return { shapeIds: [], connectorId: null };
}
