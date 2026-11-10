import { cylinderPaths } from "@/components/diagram/lib/cylinderPaths";
import { dashArray } from "@/components/diagram/lib/dashArray";
import { polygonPoints } from "@/components/diagram/lib/polygonPoints";
import { strokePaint } from "@/components/diagram/lib/strokePaint";
import type { DiagramShape } from "@/components/diagram/types";

type Props = {
  shape: DiagramShape;
  fill: string;
  stroke: string;
  selected: boolean;
};

export function ShapeOutline({ shape, fill, stroke, selected }: Props) {
  const width = strokePaint(shape.weight) + (selected ? 0.6 : 0);
  const dash = shape.kind === "text" ? (selected ? "5 4" : undefined) : dashArray(shape.dashed);
  const paint = { fill, stroke, strokeWidth: width, strokeDasharray: dash };
  if (shape.kind === "ellipse") {
    return (
      <ellipse
        cx={shape.x + shape.w / 2}
        cy={shape.y + shape.h / 2}
        rx={shape.w / 2}
        ry={shape.h / 2}
        {...paint}
      />
    );
  }
  if (shape.kind === "cylinder") {
    const paths = cylinderPaths(shape);
    return (
      <>
        <path d={paths.body} {...paint} />
        <path d={paths.cap} fill="none" stroke={stroke} strokeWidth={width} strokeDasharray={dash} />
      </>
    );
  }
  const points = polygonPoints(shape);
  if (points) return <polygon points={points} {...paint} />;
  if (shape.kind === "text") {
    return <rect x={shape.x} y={shape.y} width={shape.w} height={shape.h} {...paint} fill="transparent" />;
  }
  return (
    <rect
      x={shape.x}
      y={shape.y}
      width={shape.w}
      height={shape.h}
      rx={shape.kind === "round" ? 16 : 0}
      {...paint}
    />
  );
}
