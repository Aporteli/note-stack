import { trashItems } from "@/app/actions";
import { markClip } from "@/components/Board/lib/clipboard/lastClip";
import { writeDrawingClip } from "@/components/Board/lib/draw/clipboard/DrawingClip";
import type { DrawingData } from "@/components/Board/types/board";

export function cutDrawing(drawing: DrawingData, boardId: string, remove: (id: string) => void) {
  markClip("drawing");
  writeDrawingClip({
    cut: true,
    x: drawing.x,
    y: drawing.y,
    w: drawing.w,
    h: drawing.h,
    strokes: drawing.strokes,
  });
  remove(drawing.id);
  void trashItems([{ type: "drawing", id: drawing.id }], boardId);
}
