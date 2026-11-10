"use server";

import { isTempId } from "@/components/Board/lib/items";
import { fileIdFromCardImage } from "@/lib/files/fileIdFromCardImage";
import { fileSize } from "@/lib/files/fileSize";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function placePictureOnBoard(cardId: string, x: number, y: number, boardId: string) {
  if (isTempId(cardId)) return null;
  const card = await prisma.card.findFirst({
    where: { id: cardId, trashedAt: null, list: { boardId, trashedAt: null } },
    select: { id: true, image: true },
  });
  if (!card) return null;
  const fileId = fileIdFromCardImage(card.image);
  if (!fileId) return null;
  const file = await prisma.boardFile.findFirst({
    where: { id: fileId, boardId, trashedAt: null, kind: "image" },
  });
  if (!file) return null;

  const point = { x: Math.max(0, x), y: Math.max(0, y) };
  await prisma.$transaction([
    prisma.card.updateMany({
      where: { id: card.id },
      data: { trashedAt: new Date() },
    }),
    prisma.boardFile.updateMany({
      where: { id: file.id, boardId },
      data: point,
    }),
  ]);
  revalidatePath(`/board/${boardId}`);
  return {
    id: file.id,
    name: file.name,
    mime: file.mime,
    size: fileSize(file.size),
    kind: file.kind,
    x: point.x,
    y: point.y,
  };
}
