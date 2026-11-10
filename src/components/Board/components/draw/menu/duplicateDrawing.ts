import { placeDrawingCopy } from "@/app/drawings/placeDrawingCopy";
import type { DrawingData } from "@/components/Board/types/board";

export async function duplicateDrawing(
  drawing: DrawingData,
  boardId: string,
  onCreated: (drawing: DrawingData) => void,
) {
  const created = await placeDrawingCopy(boardId, {
    x: drawing.x + 28,
    y: drawing.y + 28,
    w: drawing.w,
    h: drawing.h,
    strokes: drawing.strokes,
  });
  onCreated(created);
}
