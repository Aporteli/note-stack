import { placeNoteCopy } from "@/app/notes/placeNoteCopy";
import { clearCutNote, readNoteClip } from "@/components/Board/lib/note/clipboard/NoteClip";
import type { NoteData } from "@/components/Board/types/note";

export async function pasteNote(boardId: string, onCreated: (note: NoteData) => void) {
  const clip = readNoteClip();
  if (!clip) return;
  const created = await placeNoteCopy(boardId, {
    text: clip.text,
    x: clip.x + 28,
    y: clip.y + 28,
    w: clip.w,
    h: clip.h,
  });
  clearCutNote();
  onCreated({ ...created, key: created.id, fresh: false });
}
