import { placeDrawingCopy } from "@/app/drawings/placeDrawingCopy";
import { clearCutDrawing, readDrawingClip } from "@/components/Board/lib/draw/clipboard/DrawingClip";
import type { DrawingData } from "@/components/Board/types/board";

export async function pasteDrawing(boardId: string, onCreated: (drawing: DrawingData) => void) {
  const clip = readDrawingClip();
  if (!clip) return;
  const created = await placeDrawingCopy(boardId, {
    x: clip.x + 28,
    y: clip.y + 28,
    w: clip.w,
    h: clip.h,
    strokes: clip.strokes,
  });
  clearCutDrawing();
  onCreated(created);
}
