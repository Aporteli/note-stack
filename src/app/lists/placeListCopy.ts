"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ListData } from "@/components/Board/types/board";

type CardCopy = { title: string; image?: string | null };

type Source = {
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  cards: CardCopy[];
};

export async function placeListCopy(boardId: string, source: Source): Promise<ListData | null> {
  const list = await prisma.list.create({
    data: {
      title: source.title,
      boardId,
      x: Math.max(0, source.x),
      y: Math.max(0, source.y),
      w: source.w,
      h: source.h,
    },
  });
  const cards: ListData["cards"] = [];
  for (let i = 0; i < source.cards.length; i++) {
    const card = source.cards[i];
    const created = await prisma.card.create({
      data: { title: card.title, listId: list.id, order: i },
    });
    if (card.image?.startsWith("data:image/")) {
      await prisma.$executeRaw`UPDATE "Card" SET "image" = ${card.image} WHERE "id" = ${created.id}`;
    }
    cards.push({ id: created.id, title: created.title, image: card.image ?? null });
  }
  revalidatePath(`/board/${boardId}`);
  return {
    id: list.id,
    title: list.title,
    x: list.x,
    y: list.y,
    w: list.w,
    h: list.h,
    z: list.z,
    locked: list.locked,
    cards,
  };
}
