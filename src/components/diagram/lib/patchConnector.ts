import type { DiagramConnector } from "@/components/diagram/types";

export function patchConnector(
  connectors: DiagramConnector[],
  id: string,
  patch: Partial<Omit<DiagramConnector, "id">>,
): DiagramConnector[] {
  return connectors.map((connector) => (connector.id === id ? { ...connector, ...patch } : connector));
}
