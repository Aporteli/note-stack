"use server";

import { revalidatePath } from "next/cache";
import { isTempId } from "@/components/Board/lib/items";
import { prisma } from "@/lib/prisma";

export async function setHeadingLocked(headingId: string, locked: boolean, boardId: string) {
  if (isTempId(headingId)) return;
  await prisma.heading.updateMany({
    where: { id: headingId, boardId, trashedAt: null },
    data: { locked },
  });
  revalidatePath(`/board/${boardId}`);
}
