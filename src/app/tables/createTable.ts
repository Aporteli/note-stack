"use server";

import { TABLE_COLS, TABLE_ROWS } from "@/components/Board/lib/table/metrics";
import { prisma } from "@/lib/prisma";

export async function createTable(boardId: string, x: number, y: number) {
  const table = await prisma.boardTable.create({
    data: {
      boardId,
      x: Math.max(0, x),
      y: Math.max(0, y),
      cols: TABLE_COLS,
      rows: TABLE_ROWS,
      cells: "{}",
    },
  });
  return { id: table.id, x: table.x, y: table.y, cols: table.cols, rows: table.rows };
}
