import { curvePath } from "@/components/diagram/lib/curvePath";
import { elbowPoints } from "@/components/diagram/lib/elbowPoints";
import { pointsPath } from "@/components/diagram/lib/pointsPath";
import { straightPoints } from "@/components/diagram/lib/straightPoints";
import type { DiagramConnector, DiagramShape } from "@/components/diagram/types";

export function connectorPath(connector: DiagramConnector, from: DiagramShape, to: DiagramShape): string {
  if (connector.route === "straight") {
    return pointsPath(straightPoints(from, connector.fromSide, to, connector.toSide));
  }
  if (connector.route === "curve") return curvePath(from, connector.fromSide, to, connector.toSide);
  return pointsPath(elbowPoints(from, connector.fromSide, to, connector.toSide));
}
