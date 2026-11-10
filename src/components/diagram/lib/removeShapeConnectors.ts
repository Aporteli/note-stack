import type { DiagramConnector } from "@/components/diagram/types";

export function removeShapeConnectors(connectors: DiagramConnector[], shapeId: string): DiagramConnector[] {
  return connectors.filter((connector) => connector.fromId !== shapeId && connector.toId !== shapeId);
}
