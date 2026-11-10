import { measureBox } from "@/components/Board/lib/arrow/measureBox";
import { sidePoint } from "@/components/Board/lib/arrow/sidePoint";
import type { ArrowData, ArrowSide } from "@/components/Board/types/arrow";

const SIDES = new Set<ArrowSide>(["top", "right", "bottom", "left"]);

export function resolveEnd(canvas: HTMLElement | null, arrow: ArrowData, end: "from" | "to") {
  const x = end === "from" ? arrow.x1 : arrow.x2;
  const y = end === "from" ? arrow.y1 : arrow.y2;
  const type = end === "from" ? arrow.fromType : arrow.toType;
  const id = end === "from" ? arrow.fromId : arrow.toId;
  const side = end === "from" ? arrow.fromSide : arrow.toSide;
  if (!canvas || !type || !id || !SIDES.has(side as ArrowSide)) return { x, y };
  const box = measureBox(canvas, type, id);
  if (!box) return { x, y };
  return sidePoint(box, side as ArrowSide);
}
