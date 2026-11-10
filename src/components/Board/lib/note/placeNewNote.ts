import type { Dispatch, SetStateAction } from "react";
import { createNote } from "@/app/notes/createNote";
import { noteDropPoint } from "@/components/Board/lib/note/noteDropPoint";
import { NOTE_H, NOTE_W } from "@/components/Board/lib/note/size";
import { tempId } from "@/components/Board/lib/note/tempId";
import type { NoteData } from "@/components/Board/types/note";

type Args = {
  boardId: string;
  pointer: { x: number; y: number };
  grab: { x: number; y: number };
  canvas: HTMLDivElement;
  setNotes: Dispatch<SetStateAction<NoteData[]>>;
};

export async function placeNewNote({ boardId, pointer, grab, canvas, setNotes }: Args) {
  const point = noteDropPoint(pointer, grab, canvas.getBoundingClientRect());
  const placeholderId = tempId();
  const placeholder: NoteData = {
    id: placeholderId,
    key: placeholderId,
    text: "",
    x: point.x,
    y: point.y,
    w: NOTE_W,
    h: NOTE_H,
    fresh: true,
  };
  setNotes((prev) => [...prev, placeholder]);

  try {
    const created = await createNote(boardId, point.x, point.y);
    setNotes((prev) =>
      prev.map((note) =>
        note.key === placeholderId
          ? { ...note, id: created.id, x: created.x, y: created.y }
          : note,
      ),
    );
  } catch (err) {
    setNotes((prev) => prev.filter((note) => note.key !== placeholderId));
    console.error("Failed to create note", err);
  }
}
