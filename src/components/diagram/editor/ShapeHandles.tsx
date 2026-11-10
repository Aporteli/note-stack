import type { PointerEvent as ReactPointerEvent } from "react";
import { CORNERS, type Corner, type DiagramShape } from "@/components/diagram/types";

const CURSOR: Record<Corner, string> = {
  nw: "nwse-resize",
  se: "nwse-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
};

type Props = {
  shape: DiagramShape;
  zoom: number;
  onPointerDown: (event: ReactPointerEvent<SVGRectElement>, corner: Corner) => void;
};

export function ShapeHandles({ shape, zoom, onPointerDown }: Props) {
  const size = 8 / zoom;
  return (
    <>
      {CORNERS.map((corner) => {
        const left = corner === "nw" || corner === "sw";
        const top = corner === "nw" || corner === "ne";
        return (
          <rect
            key={corner}
            x={(left ? shape.x : shape.x + shape.w) - size / 2}
            y={(top ? shape.y : shape.y + shape.h) - size / 2}
            width={size}
            height={size}
            fill="var(--color-paper)"
            stroke="var(--color-orchid-700)"
            strokeWidth={1.5 / zoom}
            style={{ cursor: CURSOR[corner] }}
            onPointerDown={(event) => onPointerDown(event, corner)}
          />
        );
      })}
    </>
  );
}
