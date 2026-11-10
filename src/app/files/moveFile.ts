"use server";

import { isTempId } from "@/components/Board/lib/items";
import { prisma } from "@/lib/prisma";

export async function moveFile(fileId: string, x: number, y: number, boardId: string) {
  if (isTempId(fileId)) return;
  await prisma.boardFile.updateMany({
    where: { id: fileId, boardId, trashedAt: null },
    data: { x: Math.max(0, x), y: Math.max(0, y) },
  });
}
