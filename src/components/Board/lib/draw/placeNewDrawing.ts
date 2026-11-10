import type { Dispatch, SetStateAction } from "react";
import { createBlankDrawing } from "@/app/drawings/createBlankDrawing";
import { updateDrawing } from "@/app/drawings/updateDrawing";
import { DRAW_H, DRAW_W } from "@/components/Board/lib/draw/size";
import { tempId } from "@/components/Board/lib/note/tempId";
import type { DrawingData, Stroke } from "@/components/Board/types/board";

type Args = {
  boardId: string;
  pointer: { x: number; y: number };
  grab: { x: number; y: number };
  canvas: HTMLDivElement;
  setDrawings: Dispatch<SetStateAction<DrawingData[]>>;
};

export async function placeNewDrawing({
  boardId,
  pointer,
  grab,
  canvas,
  setDrawings,
}: Args) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.max(0, pointer.x - grab.x - rect.left);
  const y = Math.max(0, pointer.y - grab.y - rect.top);
  const placeholderId = tempId();
  const placeholder: DrawingData = {
    id: placeholderId,
    x,
    y,
    w: DRAW_W,
    h: DRAW_H,
    strokes: [],
  };
  setDrawings((prev) => [...prev, placeholder]);

  try {
    const created = await createBlankDrawing(boardId, x, y);
    let strokes: Stroke[] = [];
    setDrawings((prev) => {
      const temp = prev.find((drawing) => drawing.id === placeholderId);
      strokes = temp?.strokes ?? [];
      const rest = prev.filter(
        (drawing) => drawing.id !== placeholderId && drawing.id !== created.id,
      );
      return [
        ...rest,
        {
          id: created.id,
          x: temp?.x ?? created.x,
          y: temp?.y ?? created.y,
          w: temp?.w ?? created.w,
          h: temp?.h ?? created.h,
          strokes,
        },
      ];
    });
    if (strokes.length > 0) {
      await updateDrawing(boardId, created.id, JSON.stringify(strokes));
    }
  } catch (err) {
    setDrawings((prev) => prev.filter((drawing) => drawing.id !== placeholderId));
    console.error("Failed to create drawing", err);
  }
}
