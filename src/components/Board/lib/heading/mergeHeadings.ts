import { isTempId } from "@/components/Board/lib/items";
import { toHeadingData } from "@/components/Board/lib/heading/toHeadingData";
import type { HeadingData, HeadingRecord } from "@/components/Board/types/heading";

export function mergeHeadings(local: HeadingData[], incoming: HeadingRecord[]): HeadingData[] {
  const byId = new Map(local.map((heading) => [heading.id, heading]));
  const saved = incoming.map((record) => {
    const existing = byId.get(record.id);
    if (!existing) return toHeadingData(record);
    return {
      ...existing,
      text: existing.text,
      x: existing.x,
      y: existing.y,
      w: existing.w,
      h: existing.h,
      z: existing.z ?? record.z,
      locked: existing.locked ?? record.locked,
      fontSize: existing.fontSize || record.fontSize,
      color: existing.color || record.color,
      bold: existing.bold ?? record.bold,
      align: existing.align || record.align,
    };
  });
  const pending = local.filter((heading) => isTempId(heading.id));
  return [...saved, ...pending];
}
