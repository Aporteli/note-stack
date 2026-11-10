import { markClip } from "@/components/Board/lib/clipboard/lastClip";
import { writeNoteClip } from "@/components/Board/lib/note/clipboard/NoteClip";
import type { NoteData } from "@/components/Board/types/note";

export function copyNote(note: NoteData) {
  markClip("note");
  writeNoteClip({ cut: false, text: note.text, x: note.x, y: note.y, w: note.w, h: note.h });
  void navigator.clipboard.writeText(note.text).catch(() => undefined);
}
