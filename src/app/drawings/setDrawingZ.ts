"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function setDrawingZ(drawingId: string, z: number, boardId: string) {
  if (drawingId.startsWith("temp-")) return;
  await prisma.$executeRaw`UPDATE "Drawing" SET "z" = ${Math.round(z)} WHERE "id" = ${drawingId} AND "boardId" = ${boardId}`;
  revalidatePath(`/board/${boardId}`);
}
