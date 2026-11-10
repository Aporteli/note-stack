import { isTempId } from "@/components/Board/lib/items";
import type { DrawingData, DrawingRecord, Stroke } from "@/components/Board/types/board";

function parseStrokes(raw: string): Stroke[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Stroke[]) : [];
  } catch {
    return [];
  }
}

export function mergeDrawings(local: DrawingData[], incoming: DrawingRecord[]): DrawingData[] {
  const byId = new Map(local.map((drawing) => [drawing.id, drawing]));
  const saved = incoming.map((record) => {
    const existing = byId.get(record.id);
    const parsed = parseStrokes(record.strokes);
    if (!existing) {
      return {
        id: record.id,
        x: record.x,
        y: record.y,
        w: record.w,
        h: record.h,
        z: record.z,
        locked: record.locked,
        strokes: parsed,
      };
    }
    return {
      ...existing,
      z: existing.z ?? record.z,
      locked: existing.locked ?? record.locked,
    };
  });
  const pending = local.filter((drawing) => isTempId(drawing.id));
  return [...saved, ...pending];
}
