import type { PointerEvent as ReactPointerEvent } from "react";
import { sidePoint } from "@/components/diagram/lib/sidePoint";
import { SIDES, type DiagramShape, type Side } from "@/components/diagram/types";

type Props = {
  shape: DiagramShape;
  zoom: number;
  onPointerDown: (event: ReactPointerEvent<SVGCircleElement>, side: Side) => void;
};

export function ShapePorts({ shape, zoom, onPointerDown }: Props) {
  return (
    <>
      {SIDES.map((side) => {
        const point = sidePoint(shape, side);
        return (
          <circle
            key={side}
            data-side={side}
            cx={point.x}
            cy={point.y}
            r={5.5 / zoom}
            fill="var(--color-paper)"
            stroke="var(--color-ink)"
            strokeWidth={1.5 / zoom}
            onPointerDown={(event) => onPointerDown(event, side)}
          />
        );
      })}
    </>
  );
}
