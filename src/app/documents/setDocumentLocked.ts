"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function setDocumentLocked(documentId: string, locked: boolean, boardId: string) {
  if (documentId.startsWith("temp-")) return;
  const flag = locked ? 1 : 0;
  await prisma.$executeRaw`UPDATE "Document" SET "locked" = ${flag} WHERE "id" = ${documentId} AND "boardId" = ${boardId}`;
  revalidatePath(`/board/${boardId}`);
}
