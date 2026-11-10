"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type End = {
  x: number;
  y: number;
  type: string;
  id: string;
  side: string;
};

export async function saveArrowEnd(arrowId: string, end: "from" | "to", value: End, boardId: string) {
  if (arrowId.startsWith("temp-")) return;
  const data =
    end === "from"
      ? { x1: value.x, y1: value.y, fromType: value.type, fromId: value.id, fromSide: value.side }
      : { x2: value.x, y2: value.y, toType: value.type, toId: value.id, toSide: value.side };
  await prisma.arrow.updateMany({
    where: { id: arrowId, boardId, trashedAt: null },
    data,
  });
  revalidatePath(`/board/${boardId}`);
}
