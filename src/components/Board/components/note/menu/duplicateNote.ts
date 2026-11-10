import { placeNoteCopy } from "@/app/notes/placeNoteCopy";
import type { NoteData } from "@/components/Board/types/note";

export async function duplicateNote(note: NoteData, boardId: string, onCreated: (note: NoteData) => void) {
  const created = await placeNoteCopy(boardId, {
    text: note.text,
    x: note.x + 28,
    y: note.y + 28,
    w: note.w,
    h: note.h,
  });
  onCreated({ ...created, key: created.id, fresh: false });
}
