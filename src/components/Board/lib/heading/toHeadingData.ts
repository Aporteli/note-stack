import { HEADING_ALIGN, HEADING_COLOR, HEADING_FONT } from "@/components/Board/lib/heading/defaults";
import { HEADING_H, HEADING_W } from "@/components/Board/lib/heading/size";
import type { HeadingAlign, HeadingData, HeadingRecord } from "@/components/Board/types/heading";

function alignOf(value: string | undefined): HeadingAlign {
  if (value === "left" || value === "right" || value === "center") return value;
  return HEADING_ALIGN;
}

export function toHeadingData(record: HeadingRecord): HeadingData {
  return {
    id: record.id,
    text: record.text,
    x: record.x,
    y: record.y,
    w: record.w || HEADING_W,
    h: record.h || HEADING_H,
    z: record.z,
    locked: record.locked,
    fontSize: record.fontSize || HEADING_FONT,
    color: record.color || HEADING_COLOR,
    bold: Boolean(record.bold),
    align: alignOf(record.align),
    key: record.id,
    fresh: false,
  };
}
