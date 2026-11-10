"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function setListZ(listId: string, z: number, boardId: string) {
  if (listId.startsWith("temp-")) return;
  await prisma.$executeRaw`UPDATE "List" SET "z" = ${Math.round(z)} WHERE "id" = ${listId} AND "boardId" = ${boardId}`;
  revalidatePath(`/board/${boardId}`);
}
