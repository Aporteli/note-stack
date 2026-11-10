"use server";

import { revalidatePath } from "next/cache";
import { ownerId } from "@/lib/owner";
import { prisma } from "@/lib/prisma";

export async function convertListToBoard(listId: string, boardId: string) {
  const userId = await ownerId();
  if (!userId || listId.startsWith("temp-")) return null;
  const list = await prisma.list.findFirst({
    where: { id: listId, boardId, trashedAt: null },
    include: {
      cards: { where: { trashedAt: null }, orderBy: { order: "asc" } },
    },
  });
  if (!list) return null;
  const board = await prisma.board.create({
    data: { title: list.title.trim() || "Board", userId },
  });
  const copy = await prisma.list.create({
    data: {
      title: list.title,
      boardId: board.id,
      x: 24,
      y: 24,
      w: list.w,
      h: list.h,
    },
  });
  for (let i = 0; i < list.cards.length; i++) {
    const card = list.cards[i];
    const created = await prisma.card.create({
      data: { title: card.title, description: card.description, listId: copy.id, order: i },
    });
    if (card.image) {
      await prisma.$executeRaw`UPDATE "Card" SET "image" = ${card.image} WHERE "id" = ${created.id}`;
    }
  }
  revalidatePath("/");
  return { id: board.id };
}
