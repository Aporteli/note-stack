import type { PointerEvent, RefObject } from "react";
import type { Stroke } from "@/components/Board/types/board";
import { ERASER_RADIUS, type Tool } from "@/components/Board/lib/sketch";
import { StrokeMark } from "@/components/Board/components/document/StrokeMark";

type Props = {
  svgRef: RefObject<SVGSVGElement | null>;
  width: number;
  height: number;
  strokes: Stroke[];
  current: Stroke | null;
  tool: Tool;
  className?: string;
  onPointerDown: (event: PointerEvent) => void;
  onPointerMove: (event: PointerEvent) => void;
  onPointerUp: () => void;
};

export function InkSurface({
  svgRef,
  width,
  height,
  strokes,
  current,
  tool,
  className,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: Props) {
  const drawing = tool !== "type";
  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`touch-none ${className ?? ""}`}
      style={{
        pointerEvents: drawing ? "auto" : "none",
        cursor: tool === "eraser" ? "cell" : drawing ? "crosshair" : "auto",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {strokes.map((stroke, index) => (
        <StrokeMark key={index} stroke={stroke} />
      ))}
      {current && tool !== "eraser" ? <StrokeMark stroke={current} /> : null}
      {current && tool === "eraser" && current.points.length > 0 ? (
        <circle
          cx={current.points[current.points.length - 1][0]}
          cy={current.points[current.points.length - 1][1]}
          r={ERASER_RADIUS}
          fill="rgb(15 23 42 / 0.08)"
          stroke="rgb(15 23 42 / 0.3)"
          strokeDasharray="3 3"
          pointerEvents="none"
        />
      ) : null}
    </svg>
  );
}
