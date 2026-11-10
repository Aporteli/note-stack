import { newId } from "@/components/diagram/lib/newId";
import { snap } from "@/components/diagram/lib/snap";
import type { DiagramShape, ShapeKind } from "@/components/diagram/types";

const SIZE: Record<ShapeKind, { w: number; h: number }> = {
  rect: { w: 160, h: 96 },
  round: { w: 160, h: 96 },
  ellipse: { w: 160, h: 96 },
  diamond: { w: 144, h: 112 },
  hex: { w: 144, h: 112 },
  cylinder: { w: 112, h: 128 },
  slant: { w: 160, h: 96 },
  text: { w: 160, h: 48 },
};

export function newShape(kind: ShapeKind, x: number, y: number): DiagramShape {
  const size = SIZE[kind];
  return {
    id: newId(),
    kind,
    x: snap(x - size.w / 2),
    y: snap(y - size.h / 2),
    w: size.w,
    h: size.h,
    text: kind === "text" ? "Text" : "",
    fill: "surface",
    stroke: "ink",
    dashed: false,
    weight: "medium",
    bold: false,
  };
}
