"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Stroke } from "@/components/Board/types/board";

type Source = {
  x: number;
  y: number;
  w: number;
  h: number;
  strokes: Stroke[];
};

export async function placeDrawingCopy(boardId: string, source: Source) {
  const drawing = await prisma.drawing.create({
    data: {
      boardId,
      x: Math.max(0, source.x),
      y: Math.max(0, source.y),
      w: source.w,
      h: source.h,
      strokes: JSON.stringify(source.strokes),
    },
  });
  revalidatePath(`/board/${boardId}`);
  return {
    id: drawing.id,
    x: drawing.x,
    y: drawing.y,
    w: drawing.w,
    h: drawing.h,
    strokes: source.strokes,
    z: drawing.z,
    locked: drawing.locked,
  };
}
