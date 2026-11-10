import type { PointerEvent as ReactPointerEvent } from "react";
import { connectorPath } from "@/components/diagram/lib/connectorPath";
import { dashArray } from "@/components/diagram/lib/dashArray";
import { strokePaint } from "@/components/diagram/lib/strokePaint";
import type { DiagramConnector, DiagramShape } from "@/components/diagram/types";

type Props = {
  connector: DiagramConnector;
  shapes: DiagramShape[];
  selected: boolean;
  onPointerDown: (event: ReactPointerEvent<SVGPathElement>, id: string) => void;
};

export function ConnectorPath({ connector, shapes, selected, onPointerDown }: Props) {
  const from = shapes.find((shape) => shape.id === connector.fromId);
  const to = shapes.find((shape) => shape.id === connector.toId);
  if (!from || !to) return null;
  const d = connectorPath(connector, from, to);
  const color = selected ? "var(--color-orchid-700)" : "var(--color-ink)";
  const marker = selected ? "url(#diagram-arrow-hot)" : "url(#diagram-arrow)";
  const start = connector.arrow === "start" || connector.arrow === "both" ? marker : undefined;
  const end = connector.arrow === "end" || connector.arrow === "both" ? marker : undefined;
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke="transparent"
        strokeWidth={14}
        onPointerDown={(event) => onPointerDown(event, connector.id)}
      />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokePaint(connector.weight)}
        strokeDasharray={dashArray(connector.dashed)}
        markerStart={start}
        markerEnd={end}
        pointerEvents="none"
      />
    </g>
  );
}
