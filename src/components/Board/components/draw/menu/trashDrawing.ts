import { trashItems } from "@/app/actions";

export function trashDrawing(drawingId: string, boardId: string, remove: (id: string) => void) {
  remove(drawingId);
  void trashItems([{ type: "drawing", id: drawingId }], boardId);
}
