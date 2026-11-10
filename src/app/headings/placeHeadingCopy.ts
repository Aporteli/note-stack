"use server";

import { revalidatePath } from "next/cache";
import { HEADING_ALIGN, HEADING_COLOR, HEADING_FONT } from "@/components/Board/lib/heading/defaults";
import type { HeadingAlign } from "@/components/Board/types/heading";
import { prisma } from "@/lib/prisma";

type Source = {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize?: number;
  color?: string;
  bold?: boolean;
  align?: string;
};

export async function placeHeadingCopy(boardId: string, source: Source) {
  const align: HeadingAlign =
    source.align === "left" || source.align === "right" || source.align === "center"
      ? source.align
      : HEADING_ALIGN;
  const heading = await prisma.heading.create({
    data: {
      boardId,
      text: source.text,
      x: Math.max(0, source.x),
      y: Math.max(0, source.y),
      w: source.w,
      h: source.h,
      fontSize: source.fontSize || HEADING_FONT,
      color: source.color || HEADING_COLOR,
      bold: Boolean(source.bold),
      align,
    },
  });
  revalidatePath(`/board/${boardId}`);
  return {
    id: heading.id,
    text: heading.text,
    x: heading.x,
    y: heading.y,
    w: heading.w,
    h: heading.h,
    z: heading.z,
    locked: heading.locked,
    fontSize: heading.fontSize,
    color: heading.color,
    bold: heading.bold,
    align: heading.align,
  };
}
