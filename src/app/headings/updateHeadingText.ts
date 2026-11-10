"use server";

import { isTempId } from "@/components/Board/lib/items";
import { prisma } from "@/lib/prisma";

export async function updateHeadingText(headingId: string, boardId: string, text: string) {
  if (isTempId(headingId)) return;
  await prisma.heading.updateMany({
    where: { id: headingId, boardId, trashedAt: null },
    data: { text },
  });
}
