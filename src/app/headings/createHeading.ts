"use server";

import { HEADING_H, HEADING_W } from "@/components/Board/lib/heading/size";
import { prisma } from "@/lib/prisma";

export async function createHeading(boardId: string, x: number, y: number) {
  const heading = await prisma.heading.create({
    data: {
      boardId,
      text: "",
      x: Math.max(0, x),
      y: Math.max(0, y),
      w: HEADING_W,
      h: HEADING_H,
    },
  });
  return {
    id: heading.id,
    text: heading.text,
    x: heading.x,
    y: heading.y,
    w: heading.w,
    h: heading.h,
  };
}
