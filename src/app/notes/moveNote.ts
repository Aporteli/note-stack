"use server";

import { prisma } from "@/lib/prisma";
import { isTempId } from "@/components/Board/lib/items";

export async function moveNote(noteId: string, x: number, y: number, boardId: string) {
  if (isTempId(noteId)) return;
  await prisma.note.updateMany({
    where: { id: noteId, boardId, trashedAt: null },
    data: { x: Math.max(0, x), y: Math.max(0, y) },
  });
}
