import { setDrawingLocked } from "@/app/drawings/setDrawingLocked";

export function lockDrawing(
  drawingId: string,
  locked: boolean,
  boardId: string,
  apply: (id: string, locked: boolean) => void,
) {
  apply(drawingId, locked);
  void setDrawingLocked(drawingId, locked, boardId);
}
