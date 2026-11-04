import type { Stroke } from "@/components/Board/types/board";
import { pointsToPath } from "@/components/Board/lib/sketch";

export function StrokeMark({ stroke }: { stroke: Stroke }) {
  const kind = stroke.kind ?? "pen";
  const common = {
    stroke: stroke.color,
    strokeWidth: stroke.width,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none" as const,
  };

  if (kind !== "pen" && stroke.points.length >= 2) {
    const [x1, y1] = stroke.points[0];
    const [x2, y2] = stroke.points[stroke.points.length - 1];
    if (kind === "line") {
      return <line x1={x1} y1={y1} x2={x2} y2={y2} {...common} />;
    }
    if (kind === "rect") {
      return (
        <rect
          x={Math.min(x1, x2)}
          y={Math.min(y1, y2)}
          width={Math.abs(x2 - x1)}
          height={Math.abs(y2 - y1)}
          {...common}
        />
      );
    }
    return (
      <ellipse
        cx={(x1 + x2) / 2}
        cy={(y1 + y2) / 2}
        rx={Math.max(Math.abs(x2 - x1) / 2, 0.5)}
        ry={Math.max(Math.abs(y2 - y1) / 2, 0.5)}
        {...common}
      />
    );
  }

  return <path d={pointsToPath(stroke.points)} {...common} />;
}
