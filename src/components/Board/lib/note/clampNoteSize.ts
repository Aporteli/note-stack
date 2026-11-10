import { NOTE_MIN } from "@/components/Board/lib/note/size";

export function clampNoteSize(size: number): number {
  return Math.max(NOTE_MIN, Math.round(size));
}
