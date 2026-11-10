import type { PointerEvent, RefObject } from "react";
import { pointsToPath } from "@/components/Board/lib/sketch";
import { FREEHAND_ERASER_RADIUS, type FreehandTool } from "@/components/Board/lib/freehand";
import type { Stroke } from "@/components/Board/types/board";

type Props = {
  x?: number;
  y?: number;
  w: number;
  h: number;
  svgRef: RefObject<SVGSVGElement | null>;
  tool: FreehandTool;
  strokes: Stroke[];
  current: Stroke | null;
  onPointerDown: (event: PointerEvent) => void;
  onPointerMove: (event: PointerEvent) => void;
  onPointerUp: () => void;
};

export function DrawingSheet({
  x = 0,
  y = 0,
  w,
  h,
  svgRef,
  tool,
  strokes,
  current,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: Props) {
  return (
    <svg
      ref={svgRef}
      viewBox={`${x} ${y} ${w} ${h}`}
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 h-full w-full touch-none"
      style={{ cursor: tool === "eraser" ? "cell" : "crosshair" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <rect x={x} y={y} width={w} height={h} fill="white" />
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
  );
}
