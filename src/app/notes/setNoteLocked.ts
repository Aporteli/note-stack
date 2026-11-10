"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function setNoteLocked(noteId: string, locked: boolean, boardId: string) {
  if (noteId.startsWith("temp-")) return;
  const flag = locked ? 1 : 0;
  await prisma.$executeRaw`UPDATE "Note" SET "locked" = ${flag} WHERE "id" = ${noteId} AND "boardId" = ${boardId}`;
  revalidatePath(`/board/${boardId}`);
}
