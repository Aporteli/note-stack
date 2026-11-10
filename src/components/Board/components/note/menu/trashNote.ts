import { trashItems } from "@/app/actions";

export function trashNote(noteId: string, boardId: string, remove: (id: string) => void) {
  remove(noteId);
  void trashItems([{ type: "note", id: noteId }], boardId);
}
