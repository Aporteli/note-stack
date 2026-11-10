"use server";

import { isTempId } from "@/components/Board/lib/items";
import { prisma } from "@/lib/prisma";
import type { TableCells } from "@/components/Board/types/table";

export async function saveTableCells(tableId: string, boardId: string, cells: TableCells) {
  if (isTempId(tableId)) return;
  const text = JSON.stringify(cells);
  if (text.length > 200_000) return;
  await prisma.boardTable.updateMany({
    where: { id: tableId, boardId, trashedAt: null },
    data: { cells: text },
  });
}
