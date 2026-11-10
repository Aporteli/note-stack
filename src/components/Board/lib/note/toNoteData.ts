import { NOTE_H, NOTE_W } from "@/components/Board/lib/note/size";
import type { NoteData, NoteRecord } from "@/components/Board/types/note";

export function toNoteData(record: NoteRecord): NoteData {
  return {
    id: record.id,
    text: record.text,
    x: record.x,
    y: record.y,
    w: record.w || NOTE_W,
    h: record.h || NOTE_H,
    z: record.z,
    locked: record.locked,
    key: record.id,
    fresh: false,
  };
}
