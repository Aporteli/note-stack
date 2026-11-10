import { trashItems } from "@/app/actions";
import { markClip } from "@/components/Board/lib/clipboard/lastClip";
import { writeNoteClip } from "@/components/Board/lib/note/clipboard/NoteClip";
import type { NoteData } from "@/components/Board/types/note";

export function cutNote(note: NoteData, boardId: string, remove: (id: string) => void) {
  markClip("note");
  writeNoteClip({ cut: true, text: note.text, x: note.x, y: note.y, w: note.w, h: note.h });
  void navigator.clipboard.writeText(note.text).catch(() => undefined);
  remove(note.id);
  void trashItems([{ type: "note", id: note.id }], boardId);
}
