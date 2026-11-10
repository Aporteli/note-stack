import type { DiagramConnector } from "@/components/diagram/types";

export function removeConnector(connectors: DiagramConnector[], id: string): DiagramConnector[] {
  return connectors.filter((connector) => connector.id !== id);
}
