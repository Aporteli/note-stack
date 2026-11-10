"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function setDocumentZ(documentId: string, z: number, boardId: string) {
  if (documentId.startsWith("temp-")) return;
  await prisma.$executeRaw`UPDATE "Document" SET "z" = ${Math.round(z)} WHERE "id" = ${documentId} AND "boardId" = ${boardId}`;
  revalidatePath(`/board/${boardId}`);
}
