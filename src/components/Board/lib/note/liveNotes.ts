import type { NoteData } from "@/components/Board/types/note";

type Drag = { dx: number; dy: number; ids: ReadonlySet<string> };

export function liveNotes(notes: NoteData[], drag: Drag | null): NoteData[] {
  if (!drag) return notes;
  return notes.map((note) =>
    drag.ids.has(note.id)
      ? { ...note, x: Math.max(0, note.x + drag.dx), y: Math.max(0, note.y + drag.dy) }
      : note,
  );
}
