"use server";

import { isTempId } from "@/components/Board/lib/items";
import { prisma } from "@/lib/prisma";

export async function updateDrawing(
  boardId: string,
  drawingId: string,
  strokes: string,
  box?: { x: number; y: number; w: number; h: number },
) {
  if (isTempId(drawingId)) return;
  await prisma.drawing.updateMany({
    where: { id: drawingId, boardId, trashedAt: null },
    data: box ? { strokes, x: box.x, y: box.y, w: box.w, h: box.h } : { strokes },
  });
}
