import { DIAGRAM_LIMITS } from "@/components/diagram/limits";
import { oneOf } from "@/components/diagram/lib/oneOf";
import { readFlag } from "@/components/diagram/lib/readFlag";
import { readNumber } from "@/components/diagram/lib/readNumber";
import { FILLS, LINE_WEIGHTS, SHAPE_KINDS, STROKES, type DiagramShape, type ShapeFill, type ShapeKind, type ShapeStroke } from "@/components/diagram/types";

const kinds = new Set<string>(SHAPE_KINDS);
const fills = new Set<string>(FILLS);
const strokes = new Set<string>(STROKES);

export function parseShape(value: unknown): DiagramShape | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || row.id.length === 0 || row.id.length > 80) return null;
  if (typeof row.kind !== "string" || !kinds.has(row.kind)) return null;
  const x = readNumber(row.x, DIAGRAM_LIMITS.minPos, DIAGRAM_LIMITS.maxPos);
  const y = readNumber(row.y, DIAGRAM_LIMITS.minPos, DIAGRAM_LIMITS.maxPos);
  const w = readNumber(row.w, DIAGRAM_LIMITS.minSize, DIAGRAM_LIMITS.maxSize);
  const h = readNumber(row.h, DIAGRAM_LIMITS.minSize, DIAGRAM_LIMITS.maxSize);
  if (x === null || y === null || w === null || h === null) return null;
  const fill = typeof row.fill === "string" && fills.has(row.fill) ? (row.fill as ShapeFill) : "surface";
  const stroke = typeof row.stroke === "string" && strokes.has(row.stroke) ? (row.stroke as ShapeStroke) : "ink";
  const text = typeof row.text === "string" ? row.text.slice(0, DIAGRAM_LIMITS.text) : "";
  return {
    id: row.id,
    kind: row.kind as ShapeKind,
    x,
    y,
    w,
    h,
    text,
    fill,
    stroke,
    dashed: readFlag(row.dashed),
    weight: oneOf(row.weight, LINE_WEIGHTS, "medium"),
    bold: readFlag(row.bold),
  };
}
