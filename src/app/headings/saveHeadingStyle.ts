"use server";

import {
  HEADING_ALIGN,
  HEADING_COLOR,
  HEADING_COLORS,
  HEADING_FONT,
  HEADING_FONT_MAX,
  HEADING_FONT_MIN,
} from "@/components/Board/lib/heading/defaults";
import { isTempId } from "@/components/Board/lib/items";
import type { HeadingAlign } from "@/components/Board/types/heading";
import { prisma } from "@/lib/prisma";

type Style = {
  fontSize: number;
  color: string;
  bold: boolean;
  align: string;
};

export async function saveHeadingStyle(headingId: string, boardId: string, style: Style) {
  if (isTempId(headingId)) return;
  const fontSize = Math.min(HEADING_FONT_MAX, Math.max(HEADING_FONT_MIN, Math.round(style.fontSize) || HEADING_FONT));
  const color = HEADING_COLORS.includes(style.color) ? style.color : HEADING_COLOR;
  const align: HeadingAlign =
    style.align === "left" || style.align === "right" || style.align === "center" ? style.align : HEADING_ALIGN;
  await prisma.heading.updateMany({
    where: { id: headingId, boardId, trashedAt: null },
    data: { fontSize, color, bold: style.bold, align },
  });
}
