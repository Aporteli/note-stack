import { markClip } from "@/components/Board/lib/clipboard/lastClip";
import { writeDrawingClip } from "@/components/Board/lib/draw/clipboard/DrawingClip";
import type { DrawingData } from "@/components/Board/types/board";

export function copyDrawing(drawing: DrawingData) {
  markClip("drawing");
  writeDrawingClip({
    cut: false,
    x: drawing.x,
    y: drawing.y,
    w: drawing.w,
    h: drawing.h,
    strokes: drawing.strokes,
  });
}
