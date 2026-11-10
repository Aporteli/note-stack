"use server";

import { isTempId } from "@/components/Board/lib/items";
import { prisma } from "@/lib/prisma";

export async function moveHeading(headingId: string, x: number, y: number, boardId: string) {
  if (isTempId(headingId)) return;
  await prisma.heading.updateMany({
    where: { id: headingId, boardId, trashedAt: null },
    data: { x: Math.max(0, x), y: Math.max(0, y) },
  });
}
