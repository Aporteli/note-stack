"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Stroke } from "@/components/Board/types/board";

type Source = {
  title: string;
  text: string;
  strokes: Stroke[];
  x: number;
  y: number;
};

export async function placeDocumentCopy(boardId: string, source: Source) {
  const doc = await prisma.document.create({
    data: {
      boardId,
      title: source.title,
      content: JSON.stringify({ text: source.text, strokes: source.strokes }),
      x: Math.max(0, source.x),
      y: Math.max(0, source.y),
    },
  });
  revalidatePath(`/board/${boardId}`);
  return {
    id: doc.id,
    title: doc.title,
    text: source.text,
    strokes: source.strokes,
    x: doc.x,
    y: doc.y,
    z: doc.z,
    locked: doc.locked,
  };
}
