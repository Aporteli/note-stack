import { placeHeadingCopy } from "@/app/headings/placeHeadingCopy";
import { clearCutHeading, readHeadingClip } from "@/components/Board/lib/heading/clipboard/HeadingClip";
import type { HeadingData } from "@/components/Board/types/heading";

export async function pasteHeading(boardId: string, onCreated: (heading: HeadingData) => void) {
  const clip = readHeadingClip();
  if (!clip) return;
  const created = await placeHeadingCopy(boardId, {
    text: clip.text,
    x: clip.x + 28,
    y: clip.y + 28,
    w: clip.w,
    h: clip.h,
    fontSize: clip.fontSize,
    color: clip.color,
    bold: clip.bold,
    align: clip.align,
  });
  clearCutHeading();
  onCreated({ ...created, key: created.id, fresh: false });
}
