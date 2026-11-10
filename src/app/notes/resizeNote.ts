"use server";

import { prisma } from "@/lib/prisma";
import { isTempId } from "@/components/Board/lib/items";
import { clampNoteSize } from "@/components/Board/lib/note/clampNoteSize";

export async function resizeNote(noteId: string, w: number, h: number, boardId: string) {
  if (isTempId(noteId)) return;
  await prisma.note.updateMany({
    where: { id: noteId, boardId, trashedAt: null },
    data: { w: clampNoteSize(w), h: clampNoteSize(h) },
  });
}
