"use server";

import { prisma } from "@/lib/prisma";
import { NOTE_H, NOTE_W } from "@/components/Board/lib/note/size";

export async function createNote(boardId: string, x: number, y: number) {
  const note = await prisma.note.create({
    data: {
      boardId,
      text: "",
      x: Math.max(0, x),
      y: Math.max(0, y),
      w: NOTE_W,
      h: NOTE_H,
    },
  });
  return { id: note.id, text: note.text, x: note.x, y: note.y, w: note.w, h: note.h };
}
