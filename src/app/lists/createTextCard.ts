"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createTextCard(listId: string, title: string, boardId: string) {
  if (listId.startsWith("temp-")) return null;
  const text = title.trim();
  if (!text) return null;
  const last = await prisma.card.findFirst({
    where: { listId, trashedAt: null },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const order = last ? last.order + 1 : 0;
  const card = await prisma.card.create({
    data: { title: text, listId, order },
  });
  revalidatePath(`/board/${boardId}`);
  return { id: card.id, title: card.title };
}
