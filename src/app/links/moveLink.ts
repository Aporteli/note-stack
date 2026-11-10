"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function moveLink(linkId: string, x: number, y: number, boardId: string) {
  if (linkId.startsWith("temp-")) return;
  await prisma.link.updateMany({
    where: { id: linkId, boardId, trashedAt: null },
    data: { x: Math.max(0, x), y: Math.max(0, y) },
  });
  revalidatePath(`/board/${boardId}`);
}
