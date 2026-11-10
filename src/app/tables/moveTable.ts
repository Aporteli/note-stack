"use server";

import { isTempId } from "@/components/Board/lib/items";
import { prisma } from "@/lib/prisma";

export async function moveTable(tableId: string, x: number, y: number, boardId: string) {
  if (isTempId(tableId)) return;
  await prisma.boardTable.updateMany({
    where: { id: tableId, boardId, trashedAt: null },
    data: { x: Math.max(0, x), y: Math.max(0, y) },
  });
}
