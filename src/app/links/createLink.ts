"use server";

import { prisma } from "@/lib/prisma";
import { LINK_BAR_H, LINK_W } from "@/components/Board/types/link";

export async function createLink(boardId: string, x: number, y: number) {
  const link = await prisma.link.create({
    data: {
      boardId,
      x: Math.max(0, x),
      y: Math.max(0, y),
      w: LINK_W,
      h: LINK_BAR_H,
    },
  });
  return { id: link.id, x: link.x, y: link.y, w: link.w, h: link.h };
}
