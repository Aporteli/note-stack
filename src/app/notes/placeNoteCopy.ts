"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type Source = {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export async function placeNoteCopy(boardId: string, source: Source) {
  const note = await prisma.note.create({
    data: {
      boardId,
      text: source.text,
      x: Math.max(0, source.x),
      y: Math.max(0, source.y),
      w: source.w,
      h: source.h,
    },
  });
  revalidatePath(`/board/${boardId}`);
  return {
    id: note.id,
    text: note.text,
    x: note.x,
    y: note.y,
    w: note.w,
    h: note.h,
    z: note.z,
    locked: note.locked,
  };
}
