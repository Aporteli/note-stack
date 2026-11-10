"use server";

import { clampHeadingBox } from "@/components/Board/lib/heading/clampHeadingBox";
import { isTempId } from "@/components/Board/lib/items";
import { prisma } from "@/lib/prisma";

export async function resizeHeading(headingId: string, w: number, h: number, boardId: string) {
  if (isTempId(headingId)) return;
  const size = clampHeadingBox(w, h);
  await prisma.heading.updateMany({
    where: { id: headingId, boardId, trashedAt: null },
    data: size,
  });
}
