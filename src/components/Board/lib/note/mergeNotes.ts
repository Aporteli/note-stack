import type { NoteData, NoteRecord } from "@/components/Board/types/note";
import { toNoteData } from "@/components/Board/lib/note/toNoteData";
import { isTempId } from "@/components/Board/lib/items";

export function mergeNotes(local: NoteData[], incoming: NoteRecord[]): NoteData[] {
  const byId = new Map(local.map((note) => [note.id, note]));
  const saved = incoming.map((record) => {
    const existing = byId.get(record.id);
    if (!existing) return toNoteData(record);
    return {
      ...existing,
      text: existing.text,
      x: existing.x,
      y: existing.y,
      w: existing.w,
      h: existing.h,
      z: existing.z ?? record.z,
      locked: existing.locked ?? record.locked,
    };
  });
  const pending = local.filter((note) => isTempId(note.id));
  return [...saved, ...pending];
}
