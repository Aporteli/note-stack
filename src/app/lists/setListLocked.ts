"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function setListLocked(listId: string, locked: boolean, boardId: string) {
  if (listId.startsWith("temp-")) return;
  const flag = locked ? 1 : 0;
  await prisma.$executeRaw`UPDATE "List" SET "locked" = ${flag} WHERE "id" = ${listId} AND "boardId" = ${boardId}`;
  revalidatePath(`/board/${boardId}`);
}
