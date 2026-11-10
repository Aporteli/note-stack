"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function setNoteZ(noteId: string, z: number, boardId: string) {
  if (noteId.startsWith("temp-")) return;
  await prisma.$executeRaw`UPDATE "Note" SET "z" = ${Math.round(z)} WHERE "id" = ${noteId} AND "boardId" = ${boardId}`;
  revalidatePath(`/board/${boardId}`);
}
