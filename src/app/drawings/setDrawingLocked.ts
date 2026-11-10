"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function setDrawingLocked(drawingId: string, locked: boolean, boardId: string) {
  if (drawingId.startsWith("temp-")) return;
  const flag = locked ? 1 : 0;
  await prisma.$executeRaw`UPDATE "Drawing" SET "locked" = ${flag} WHERE "id" = ${drawingId} AND "boardId" = ${boardId}`;
  revalidatePath(`/board/${boardId}`);
}
