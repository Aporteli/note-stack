"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ItemRef, TrashBundle } from "@/components/Board/types/board";

/* -------------------- HELPERS -------------------- */

/** Optimistic placeholder ids start with "temp-" and never reach the DB. */
const isTempId = (id: string) => id.startsWith("temp-");

/* -------------------- BOARDS -------------------- */

export async function getBoards() {
  return prisma.board.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createBoard(title: string) {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: { email: "demo@example.com", name: "Demo User" },
    });
  }
  const board = await prisma.board.create({ data: { title, userId: user.id } });
  revalidatePath("/");
  return board;
}

export async function deleteBoard(id: string) {
  // deleteMany is idempotent — no throw if the row is already gone.
  await prisma.board.deleteMany({ where: { id } });
  revalidatePath("/");
}

/* -------------------- BOARD DETAIL -------------------- */

export async function getBoard(boardId: string) {
  return prisma.board.findUnique({
    where: { id: boardId },
    include: {
      lists: {
        where: { trashedAt: null },
        include: {
          cards: {
            where: { trashedAt: null },
            orderBy: { order: "asc" },
          },
        },
      },
      drawings: { where: { trashedAt: null } },
      documents: { where: { trashedAt: null } },
    },
  });
}

/* -------------------- LISTS -------------------- */

const LIST_W = 296;
const LIST_GAP = 16;
const LIST_PAD = 24;

export async function createList(boardId: string, title: string) {
  const existing = await prisma.list.findMany({
    where: { boardId, trashedAt: null },
    select: { x: true },
  });
  const maxX = existing.reduce((m, l) => Math.max(m, l.x), 0);
  const x = existing.length ? maxX + LIST_W + LIST_GAP : LIST_PAD;
  const y = LIST_PAD;
  await prisma.list.create({ data: { title, boardId, x, y } });
  revalidatePath(`/board/${boardId}`);
}

export async function createListAt(
  boardId: string,
  title: string,
  x: number,
  y: number,
) {
  const list = await prisma.list.create({
    data: { title, boardId, x: Math.max(0, x), y: Math.max(0, y) },
  });
  revalidatePath(`/board/${boardId}`);
  return list;
}

export async function deleteList(listId: string, boardId: string) {
  // Idempotent — never throws for missing rows.
  await prisma.list.deleteMany({ where: { id: listId } });
  revalidatePath(`/board/${boardId}`);
}

export async function moveListPosition(
  listId: string,
  x: number,
  y: number,
  boardId: string,
) {
  // Skip optimistic placeholders — they don't exist in the DB.
  if (isTempId(listId)) return;

  // updateMany no-ops if the row is missing or already trashed, instead of
  // throwing P2025 like update() would.
  await prisma.list.updateMany({
    where: { id: listId, trashedAt: null },
    data: { x: Math.max(0, x), y: Math.max(0, y) },
  });
  revalidatePath(`/board/${boardId}`);
}

/* -------------------- CARDS -------------------- */

export async function createCard(
  listId: string,
  title: string,
  boardId: string,
) {
  if (isTempId(listId)) return;
  const last = await prisma.card.findFirst({
    where: { listId, trashedAt: null },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const order = last ? last.order + 1 : 0;
  await prisma.card.create({ data: { title, listId, order } });
  revalidatePath(`/board/${boardId}`);
}

export async function deleteCard(cardId: string, boardId: string) {
  await prisma.card.deleteMany({ where: { id: cardId } });
  revalidatePath(`/board/${boardId}`);
}

export async function moveCard(
  cardId: string,
  newListId: string,
  newIndex: number,
  boardId: string,
) {
  if (isTempId(cardId) || isTempId(newListId)) return;

  await prisma.$transaction(async (tx) => {
    const card = await tx.card.findUnique({ where: { id: cardId } });
    // Card was trashed/purged between drag start and drag end → no-op.
    if (!card || card.trashedAt) return;

    const targetList = await tx.list.findUnique({ where: { id: newListId } });
    // Target list is gone → no-op.
    if (!targetList || targetList.trashedAt) return;

    const oldListId = card.listId;

    const newListCards = await tx.card.findMany({
      where: { listId: newListId, id: { not: cardId }, trashedAt: null },
      orderBy: { order: "asc" },
    });
    newListCards.splice(newIndex, 0, card);

    for (let i = 0; i < newListCards.length; i++) {
      await tx.card.updateMany({
        where: { id: newListCards[i].id, trashedAt: null },
        data: { listId: newListId, order: i },
      });
    }

    if (oldListId !== newListId) {
      const oldListCards = await tx.card.findMany({
        where: { listId: oldListId, trashedAt: null },
        orderBy: { order: "asc" },
      });
      for (let i = 0; i < oldListCards.length; i++) {
        await tx.card.updateMany({
          where: { id: oldListCards[i].id, trashedAt: null },
          data: { order: i },
        });
      }
    }
  });
  revalidatePath(`/board/${boardId}`);
}

/* -------------------- DRAWINGS -------------------- */

export async function createDrawing(
  boardId: string,
  x: number,
  y: number,
  w: number,
  h: number,
  strokes: string,
) {
  const drawing = await prisma.drawing.create({
    data: { boardId, x, y, w, h, strokes },
  });
  revalidatePath(`/board/${boardId}`);
  return drawing;
}

export async function moveDrawings(
  moves: { id: string; x: number; y: number }[],
  boardId: string,
) {
  // Filter out any temp ids before touching the DB.
  const realMoves = moves.filter((m) => !isTempId(m.id));
  if (realMoves.length === 0) return;

  // updateMany per move inside one transaction → missing/trashed rows no-op.
  await prisma.$transaction(
    realMoves.map((m) =>
      prisma.drawing.updateMany({
        where: { id: m.id, trashedAt: null },
        data: { x: Math.max(0, m.x), y: Math.max(0, m.y) },
      }),
    ),
  );
  revalidatePath(`/board/${boardId}`);
}

export async function deleteDrawings(ids: string[], boardId: string) {
  if (ids.length === 0) return;
  await prisma.drawing.deleteMany({ where: { id: { in: ids } } });
  revalidatePath(`/board/${boardId}`);
}

/* -------------------- DOCUMENTS -------------------- */

export async function createDocumentAt(
  boardId: string,
  x: number,
  y: number,
) {
  const doc = await prisma.document.create({
    data: {
      boardId,
      title: "Untitled",
      content: JSON.stringify({ text: "", strokes: [] }),
      x: Math.max(0, x),
      y: Math.max(0, y),
    },
  });
  revalidatePath(`/board/${boardId}`);
  return doc;
}

export async function updateDocument(
  documentId: string,
  boardId: string,
  payload: { title: string; content: string },
) {
  if (isTempId(documentId)) return;

  // No-op if the doc was trashed/purged while the modal was open.
  await prisma.document.updateMany({
    where: { id: documentId, trashedAt: null },
    data: { title: payload.title, content: payload.content },
  });
  revalidatePath(`/board/${boardId}`);
}

export async function moveDocumentPosition(
  documentId: string,
  x: number,
  y: number,
  boardId: string,
) {
  if (isTempId(documentId)) return;

  await prisma.document.updateMany({
    where: { id: documentId, trashedAt: null },
    data: { x: Math.max(0, x), y: Math.max(0, y) },
  });
  revalidatePath(`/board/${boardId}`);
}

/* -------------------- TRASH -------------------- */

export async function getTrash(boardId: string): Promise<TrashBundle> {
  const [lists, cards, drawings, documents] = await Promise.all([
    prisma.list.findMany({
      where: { boardId, trashedAt: { not: null } },
      orderBy: { trashedAt: "desc" },
      select: { id: true, title: true, trashedAt: true },
    }),
    prisma.card.findMany({
      where: { list: { boardId }, trashedAt: { not: null } },
      orderBy: { trashedAt: "desc" },
      select: {
        id: true,
        title: true,
        trashedAt: true,
        list: { select: { title: true } },
      },
    }),
    prisma.drawing.findMany({
      where: { boardId, trashedAt: { not: null } },
      orderBy: { trashedAt: "desc" },
      select: { id: true, trashedAt: true },
    }),
    prisma.document.findMany({
      where: { boardId, trashedAt: { not: null } },
      orderBy: { trashedAt: "desc" },
      select: { id: true, title: true, trashedAt: true },
    }),
  ]);

  return {
    lists: lists.map((l) => ({
      type: "list" as const,
      id: l.id,
      title: l.title,
      trashedAt: l.trashedAt!.toISOString(),
    })),
    cards: cards.map((c) => ({
      type: "card" as const,
      id: c.id,
      title: c.title,
      listTitle: c.list.title,
      trashedAt: c.trashedAt!.toISOString(),
    })),
    drawings: drawings.map((d) => ({
      type: "drawing" as const,
      id: d.id,
      title: "Drawing",
      trashedAt: d.trashedAt!.toISOString(),
    })),
    documents: documents.map((d) => ({
      type: "document" as const,
      id: d.id,
      title: d.title,
      trashedAt: d.trashedAt!.toISOString(),
    })),
  };
}

export async function trashItems(items: ItemRef[], boardId: string) {
  if (items.length === 0) return;
  const now = new Date();

  const listIds = items.filter((i) => i.type === "list").map((i) => i.id);
  const cardIds = items.filter((i) => i.type === "card").map((i) => i.id);
  const drawingIds = items.filter((i) => i.type === "drawing").map((i) => i.id);
  const docIds = items.filter((i) => i.type === "document").map((i) => i.id);

  await prisma.$transaction([
    ...(listIds.length
      ? [
          prisma.list.updateMany({
            where: { id: { in: listIds } },
            data: { trashedAt: now },
          }),
        ]
      : []),
    ...(cardIds.length
      ? [
          prisma.card.updateMany({
            where: { id: { in: cardIds } },
            data: { trashedAt: now },
          }),
        ]
      : []),
    ...(drawingIds.length
      ? [
          prisma.drawing.updateMany({
            where: { id: { in: drawingIds } },
            data: { trashedAt: now },
          }),
        ]
      : []),
    ...(docIds.length
      ? [
          prisma.document.updateMany({
            where: { id: { in: docIds } },
            data: { trashedAt: now },
          }),
        ]
      : []),
  ]);

  revalidatePath(`/board/${boardId}`);
}

export async function restoreItems(items: ItemRef[], boardId: string) {
  if (items.length === 0) return;

  const listIds = items.filter((i) => i.type === "list").map((i) => i.id);
  const cardIds = items.filter((i) => i.type === "card").map((i) => i.id);
  const drawingIds = items.filter((i) => i.type === "drawing").map((i) => i.id);
  const docIds = items.filter((i) => i.type === "document").map((i) => i.id);

  await prisma.$transaction([
    ...(listIds.length
      ? [
          prisma.list.updateMany({
            where: { id: { in: listIds } },
            data: { trashedAt: null },
          }),
        ]
      : []),
    ...(cardIds.length
      ? [
          prisma.card.updateMany({
            where: { id: { in: cardIds } },
            data: { trashedAt: null },
          }),
        ]
      : []),
    ...(drawingIds.length
      ? [
          prisma.drawing.updateMany({
            where: { id: { in: drawingIds } },
            data: { trashedAt: null },
          }),
        ]
      : []),
    ...(docIds.length
      ? [
          prisma.document.updateMany({
            where: { id: { in: docIds } },
            data: { trashedAt: null },
          }),
        ]
      : []),
  ]);

  revalidatePath(`/board/${boardId}`);
}

export async function purgeItems(items: ItemRef[], boardId: string) {
  if (items.length === 0) return;

  const listIds = items.filter((i) => i.type === "list").map((i) => i.id);
  const cardIds = items.filter((i) => i.type === "card").map((i) => i.id);
  const drawingIds = items.filter((i) => i.type === "drawing").map((i) => i.id);
  const docIds = items.filter((i) => i.type === "document").map((i) => i.id);

  // Order: drawings → documents → cards → lists.
  // Lists last so their cascade can't kill a card row we already removed.
  await prisma.$transaction([
    ...(drawingIds.length
      ? [prisma.drawing.deleteMany({ where: { id: { in: drawingIds } } })]
      : []),
    ...(docIds.length
      ? [prisma.document.deleteMany({ where: { id: { in: docIds } } })]
      : []),
    ...(cardIds.length
      ? [prisma.card.deleteMany({ where: { id: { in: cardIds } } })]
      : []),
    ...(listIds.length
      ? [prisma.list.deleteMany({ where: { id: { in: listIds } } })]
      : []),
  ]);

  revalidatePath(`/board/${boardId}`);
}

export async function duplicateItems(items: ItemRef[], boardId: string) {
  if (items.length === 0) return;

  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      if (item.type === "list") {
        const src = await tx.list.findUnique({
          where: { id: item.id },
          include: {
            cards: {
              where: { trashedAt: null },
              orderBy: { order: "asc" },
            },
          },
        });
        if (!src) continue;
        const copy = await tx.list.create({
          data: {
            title: `${src.title} (copy)`,
            boardId: src.boardId,
            x: src.x + 28,
            y: src.y + 28,
          },
        });
        for (let i = 0; i < src.cards.length; i++) {
          await tx.card.create({
            data: {
              title: src.cards[i].title,
              description: src.cards[i].description,
              listId: copy.id,
              order: i,
            },
          });
        }
      } else if (item.type === "card") {
        const src = await tx.card.findUnique({ where: { id: item.id } });
        if (!src) continue;
        const maxOrder = await tx.card.aggregate({
          where: { listId: src.listId, trashedAt: null },
          _max: { order: true },
        });
        await tx.card.create({
          data: {
            title: `${src.title} (copy)`,
            description: src.description,
            listId: src.listId,
            order: (maxOrder._max.order ?? -1) + 1,
          },
        });
      } else if (item.type === "drawing") {
        const src = await tx.drawing.findUnique({ where: { id: item.id } });
        if (!src) continue;
        await tx.drawing.create({
          data: {
            boardId: src.boardId,
            x: src.x + 24,
            y: src.y + 24,
            w: src.w,
            h: src.h,
            strokes: src.strokes,
          },
        });
      } else {
        const src = await tx.document.findUnique({ where: { id: item.id } });
        if (!src) continue;
        await tx.document.create({
          data: {
            boardId: src.boardId,
            title: `${src.title} (copy)`,
            content: src.content,
            x: src.x + 28,
            y: src.y + 28,
          },
        });
      }
    }
  });

  revalidatePath(`/board/${boardId}`);
}