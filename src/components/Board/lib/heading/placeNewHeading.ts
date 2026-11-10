import type { Dispatch, SetStateAction } from "react";
import { createHeading } from "@/app/headings/createHeading";
import { HEADING_ALIGN, HEADING_COLOR, HEADING_FONT } from "@/components/Board/lib/heading/defaults";
import { HEADING_H, HEADING_W } from "@/components/Board/lib/heading/size";
import { noteDropPoint } from "@/components/Board/lib/note/noteDropPoint";
import { tempId } from "@/components/Board/lib/note/tempId";
import type { HeadingData } from "@/components/Board/types/heading";

type Args = {
  boardId: string;
  pointer: { x: number; y: number };
  grab: { x: number; y: number };
  canvas: HTMLDivElement;
  setHeadings: Dispatch<SetStateAction<HeadingData[]>>;
};

export async function placeNewHeading({ boardId, pointer, grab, canvas, setHeadings }: Args) {
  const point = noteDropPoint(pointer, grab, canvas.getBoundingClientRect());
  const placeholderId = tempId();
  const placeholder: HeadingData = {
    id: placeholderId,
    key: placeholderId,
    text: "",
    x: point.x,
    y: point.y,
    w: HEADING_W,
    h: HEADING_H,
    fontSize: HEADING_FONT,
    color: HEADING_COLOR,
    bold: false,
    align: HEADING_ALIGN,
    fresh: true,
  };
  setHeadings((prev) => [...prev, placeholder]);

  try {
    const created = await createHeading(boardId, point.x, point.y);
    setHeadings((prev) =>
      prev.map((heading) =>
        heading.key === placeholderId
          ? { ...heading, id: created.id, x: created.x, y: created.y }
          : heading,
      ),
    );
  } catch (err) {
    setHeadings((prev) => prev.filter((heading) => heading.key !== placeholderId));
    console.error("Failed to create heading", err);
  }
}
