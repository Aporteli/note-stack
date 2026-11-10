import { placeHeadingCopy } from "@/app/headings/placeHeadingCopy";
import type { HeadingData } from "@/components/Board/types/heading";

export async function duplicateHeading(
  heading: HeadingData,
  boardId: string,
  onCreated: (heading: HeadingData) => void,
) {
  const created = await placeHeadingCopy(boardId, {
    text: heading.text,
    x: heading.x + 28,
    y: heading.y + 28,
    w: heading.w,
    h: heading.h,
    fontSize: heading.fontSize,
    color: heading.color,
    bold: heading.bold,
    align: heading.align,
  });
  onCreated({ ...created, key: created.id, fresh: false });
}
