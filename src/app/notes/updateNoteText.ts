"use server";

import { prisma } from "@/lib/prisma";
import { isTempId } from "@/components/Board/lib/items";

export async function updateNoteText(noteId: string, boardId: string, text: string) {
  if (isTempId(noteId)) return;
  await prisma.note.updateMany({
    where: { id: noteId, boardId, trashedAt: null },
    data: { text },
  });
}
