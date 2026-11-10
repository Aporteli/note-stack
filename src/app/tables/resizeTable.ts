"use server";

import { clampCount } from "@/components/Board/lib/table/clampCount";
import { MAX_COLS, MAX_ROWS, MIN_COLS, MIN_ROWS } from "@/components/Board/lib/table/metrics";
import { isTempId } from "@/components/Board/lib/items";
import { prisma } from "@/lib/prisma";

export async function resizeTable(tableId: string, cols: number, rows: number, boardId: string) {
  if (isTempId(tableId)) return;
  await prisma.boardTable.updateMany({
    where: { id: tableId, boardId, trashedAt: null },
    data: {
      cols: clampCount(cols, MIN_COLS, MAX_COLS),
      rows: clampCount(rows, MIN_ROWS, MAX_ROWS),
    },
  });
}
