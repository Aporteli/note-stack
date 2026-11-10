"use server";

import { prisma } from "@/lib/prisma";

type Ends = { x1: number; y1: number; x2: number; y2: number };

export async function createArrow(boardId: string, ends: Ends) {
  const arrow = await prisma.arrow.create({
    data: {
      boardId,
      x1: ends.x1,
      y1: ends.y1,
      x2: ends.x2,
      y2: ends.y2,
    },
  });
  return {
    id: arrow.id,
    x1: arrow.x1,
    y1: arrow.y1,
    x2: arrow.x2,
    y2: arrow.y2,
    fromType: arrow.fromType,
    fromId: arrow.fromId,
    fromSide: arrow.fromSide,
    toType: arrow.toType,
    toId: arrow.toId,
    toSide: arrow.toSide,
  };
}
