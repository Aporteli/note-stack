import { trashItems } from "@/app/actions";
import { markClip } from "@/components/Board/lib/clipboard/lastClip";
import { HEADING_ALIGN, HEADING_COLOR, HEADING_FONT } from "@/components/Board/lib/heading/defaults";
import { writeHeadingClip } from "@/components/Board/lib/heading/clipboard/HeadingClip";
import type { HeadingAlign, HeadingData } from "@/components/Board/types/heading";

function alignOf(value: string | undefined): HeadingAlign {
  if (value === "left" || value === "right" || value === "center") return value;
  return HEADING_ALIGN;
}

export function cutHeading(heading: HeadingData, boardId: string, remove: (id: string) => void) {
  markClip("heading");
  writeHeadingClip({
    cut: true,
    text: heading.text,
    x: heading.x,
    y: heading.y,
    w: heading.w,
    h: heading.h,
    fontSize: heading.fontSize || HEADING_FONT,
    color: heading.color || HEADING_COLOR,
    bold: Boolean(heading.bold),
    align: alignOf(heading.align),
  });
  void navigator.clipboard.writeText(heading.text).catch(() => undefined);
  remove(heading.id);
  void trashItems([{ type: "heading", id: heading.id }], boardId);
}
