import type { PointerEvent, RefObject } from "react";
import type { Stroke } from "@/components/Board/types/board";
import { FREEHAND_ERASER_RADIUS, type FreehandTool } from "@/components/Board/lib/freehand";
import { pointsToPath } from "@/components/Board/lib/sketch";

type Props = {
  width: number;
  height: number;
  svgRef: RefObject<SVGSVGElement | null>;
  tool: FreehandTool;
  strokes: Stroke[];
  current: Stroke | null;
  onPointerDown: (event: PointerEvent) => void;
  onPointerMove: (event: PointerEvent) => void;
  onPointerUp: () => void;
};

export function FreehandCanvas({
  width,
  height,
  svgRef,
  tool,
  strokes,
  current,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: Props) {
  return (
    <div
      className="absolute inset-0 z-40"
      style={{ width, height }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0 touch-none bg-blue-500/[0.03]"
        style={{ cursor: tool === "eraser" ? "cell" : "crosshair" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {strokes.map((stroke, index) => (
          <path
            key={index}
            d={pointsToPath(stroke.points)}
            stroke={stroke.color}
            strokeWidth={stroke.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ))}
        {current && tool !== "eraser" ? (
          <path
            d={pointsToPath(current.points)}
            stroke={current.color}
            strokeWidth={current.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ) : null}
        {current && tool === "eraser" && current.points.length > 0 ? (
          <circle
            cx={current.points[current.points.length - 1][0]}
            cy={current.points[current.points.length - 1][1]}
            r={FREEHAND_ERASER_RADIUS}
            fill="rgb(15 23 42 / 0.08)"
            stroke="rgb(15 23 42 / 0.3)"
            strokeDasharray="3 3"
            pointerEvents="none"
          />
        ) : null}
      </svg>
    </div>
  );
}
