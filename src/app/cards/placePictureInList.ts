"use server";

import { isTempId } from "@/components/Board/lib/items";
import { pictureCardSrc } from "@/lib/files/pictureCardSrc";
import { prisma } from "@/lib/prisma";

export async function placePictureInList(listId: string, fileId: string, name: string, boardId: string) {
  if (isTempId(listId) || isTempId(fileId)) return null;
  const file = await prisma.boardFile.findFirst({
    where: { id: fileId, boardId, trashedAt: null, kind: "image" },
    select: { id: true, name: true },
  });
  const list = await prisma.list.findFirst({
    where: { id: listId, boardId, trashedAt: null },
    select: { id: true },
  });
  if (!file || !list) return null;

  const last = await prisma.card.findFirst({
    where: { listId, trashedAt: null },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const card = await prisma.card.create({
    data: {
      title: name.trim() || file.name,
      image: pictureCardSrc(file.id),
      listId,
      order: last ? last.order + 1 : 0,
    },
  });
  return { id: card.id, title: card.title, image: card.image };
}
