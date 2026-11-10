"use server";

import { DRAW_H, DRAW_W } from "@/components/Board/lib/draw/size";
import { prisma } from "@/lib/prisma";

export async function createBlankDrawing(boardId: string, x: number, y: number) {
  const drawing = await prisma.drawing.create({
    data: {
      boardId,
      x: Math.max(0, x),
      y: Math.max(0, y),
      w: DRAW_W,
      h: DRAW_H,
      strokes: "[]",
    },
  });
  return { id: drawing.id, x: drawing.x, y: drawing.y, w: drawing.w, h: drawing.h };
}
