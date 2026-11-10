import { setNoteLocked } from "@/app/notes/setNoteLocked";

export function lockNote(
  noteId: string,
  locked: boolean,
  boardId: string,
  apply: (id: string, locked: boolean) => void,
) {
  apply(noteId, locked);
  void setNoteLocked(noteId, locked, boardId);
}
