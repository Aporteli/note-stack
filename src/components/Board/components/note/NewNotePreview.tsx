import { NoteCorner } from "@/components/Board/components/note/NoteCorner";
import { NOTE_H, NOTE_W } from "@/components/Board/lib/note/size";

export function NewNotePreview() {
  return (
    <div
      className="relative overflow-hidden border-2 border-slate-800 bg-white shadow-lift-3"
      style={{ width: NOTE_W, height: NOTE_H }}
    >
      <p className="p-4 text-[15px] leading-6 text-slate-400">Start typing...</p>
      <NoteCorner />
    </div>
  );
}
