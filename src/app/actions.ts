"use server";

import { copyStoredFile } from "@/lib/files/copyStoredFile";
import { fileSize } from "@/lib/files/fileSize";
import { visibleBoardFiles } from "@/lib/files/visibleBoardFiles";
import { removeStoredFile } from "@/lib/files/removeStoredFile";
import { prisma } from "@/lib/prisma";
import { ownerId } from "@/lib/owner";
import { revalidatePath } from "next/cache";
import type { ItemRef, TrashBundle } from "@/components/Board/types/board";
import { LIST_W, clampListHeight, clampListWidth } from "@/components/Board/lib/list/size";

/* -------------------- HELPERS -------------------- */

/** Optimistic placeholder ids start with "temp-" and never reach the DB. */
const isTempId = (id: string) => id.startsWith("temp-");

/* -------------------- BOARDS -------------------- */

export async function getBoards() {
  const userId = await ownerId();
  if (!userId) return [];
  return prisma.board.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createBoard(title: string) {
  const userId = await ownerId();
  if (!userId) return null;
  const board = await prisma.board.create({ data: { title, userId } });
  revalidatePath("/");
  return board;
}

export async function renameBoard(id: string, title: string) {
  const text = title.trim().slice(0, 80);
  if (!id || !text) return;
  const userId = await ownerId();
  if (!userId) return;
  await prisma.board.updateMany({
    where: { id, userId },
    data: { title: text },
  });
  revalidatePath("/");
  revalidatePath(`/board/${id}`);
}

export async function deleteBoard(id: string) {
  const userId = await ownerId();
  if (!userId) return;
  await prisma.board.deleteMany({ where: { id, userId } });
  revalidatePath("/");
}

/* -------------------- BOARD DETAIL -------------------- */

export async function getBoard(boardId: string) {
  const userId = await ownerId();
  if (!userId) return null;
  const board = await prisma.board.findFirst({
    where: { id: boardId, userId },
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
      notes: { where: { trashedAt: null } },
      links: { where: { trashedAt: null } },
      arrows: { where: { trashedAt: null } },
      headings: { where: { trashedAt: null } },
      files: { where: { trashedAt: null } },
      tables: { where: { trashedAt: null } },
    },
  });
  if (!board) return null;
  return {
    ...board,
    files: visibleBoardFiles(
      board.files,
      board.lists.flatMap((list) => list.cards),
    ).map((file) => ({ ...file, size: fileSize(file.size) })),
  };
}

/* -------------------- LISTS -------------------- */

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

export async function renameList(listId: string, title: string, boardId: string) {
  if (isTempId(listId)) return;
  const next = title.trim();
  if (!next) return;
  await prisma.list.updateMany({
    where: { id: listId, boardId, trashedAt: null },
    data: { title: next },
  });
  revalidatePath(`/board/${boardId}`);
}

export async function deleteList(listId: string, boardId: string) {
  // Idempotent — never throws for missing rows.
  await prisma.list.deleteMany({ where: { id: listId } });
  revalidatePath(`/board/${boardId}`);
}

export async function resizeList(
  listId: string,
  w: number,
  h: number,
  boardId: string,
) {
  if (isTempId(listId)) return;
  await prisma.list.updateMany({
    where: { id: listId, boardId, trashedAt: null },
    data: { w: clampListWidth(w), h: clampListHeight(h) },
  });
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

export async function createPictureCard(listId: string, image: string, boardId: string) {
  if (isTempId(listId)) return null;
  if (!image.startsWith("data:image/") || image.length > 5_500_000) return null;
  const last = await prisma.card.findFirst({
    where: { listId, trashedAt: null },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const order = last ? last.order + 1 : 0;
  const card = await prisma.card.create({
    data: { title: "", listId, order },
  });
  await prisma.$executeRaw`UPDATE "Card" SET "image" = ${image} WHERE "id" = ${card.id}`;
  revalidatePath(`/board/${boardId}`);
  return { id: card.id, title: card.title, image };
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
  const [lists, cards, drawings, documents, notes, links, arrows, headings, files, tables] = await Promise.all([
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
    prisma.note.findMany({
      where: { boardId, trashedAt: { not: null } },
      orderBy: { trashedAt: "desc" },
      select: { id: true, text: true, trashedAt: true },
    }),
    prisma.link.findMany({
      where: { boardId, trashedAt: { not: null } },
      orderBy: { trashedAt: "desc" },
      select: { id: true, title: true, url: true, trashedAt: true },
    }),
    prisma.arrow.findMany({
      where: { boardId, trashedAt: { not: null } },
      orderBy: { trashedAt: "desc" },
      select: { id: true, trashedAt: true },
    }),
    prisma.heading.findMany({
      where: { boardId, trashedAt: { not: null } },
      orderBy: { trashedAt: "desc" },
      select: { id: true, text: true, trashedAt: true },
    }),
    prisma.boardFile.findMany({
      where: { boardId, trashedAt: { not: null } },
      orderBy: { trashedAt: "desc" },
      select: { id: true, name: true, trashedAt: true },
    }),
    prisma.boardTable.findMany({
      where: { boardId, trashedAt: { not: null } },
      orderBy: { trashedAt: "desc" },
      select: { id: true, trashedAt: true },
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
    notes: notes.map((note) => ({
      type: "note" as const,
      id: note.id,
      title: note.text.trim() || "Note",
      trashedAt: note.trashedAt!.toISOString(),
    })),
    links: links.map((link) => ({
      type: "link" as const,
      id: link.id,
      title: link.title.trim() || link.url || "Link",
      trashedAt: link.trashedAt!.toISOString(),
    })),
    arrows: arrows.map((arrow) => ({
      type: "arrow" as const,
      id: arrow.id,
      title: "Arrow",
      trashedAt: arrow.trashedAt!.toISOString(),
    })),
    headings: headings.map((heading) => ({
      type: "heading" as const,
      id: heading.id,
      title: heading.text.trim() || "Heading",
      trashedAt: heading.trashedAt!.toISOString(),
    })),
    files: files.map((file) => ({
      type: "file" as const,
      id: file.id,
      title: file.name || "File",
      trashedAt: file.trashedAt!.toISOString(),
    })),
    tables: tables.map((table) => ({
      type: "table" as const,
      id: table.id,
      title: "Table",
      trashedAt: table.trashedAt!.toISOString(),
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
  const noteIds = items.filter((i) => i.type === "note").map((i) => i.id);
  const linkIds = items.filter((i) => i.type === "link").map((i) => i.id);
  const arrowIds = items.filter((i) => i.type === "arrow").map((i) => i.id);
  const headingIds = items.filter((i) => i.type === "heading").map((i) => i.id);
  const fileIds = items.filter((i) => i.type === "file").map((i) => i.id);
  const tableIds = items.filter((i) => i.type === "table").map((i) => i.id);

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
    ...(noteIds.length
      ? [
          prisma.note.updateMany({
            where: { id: { in: noteIds } },
            data: { trashedAt: now },
          }),
        ]
      : []),
    ...(linkIds.length
      ? [
          prisma.link.updateMany({
            where: { id: { in: linkIds } },
            data: { trashedAt: now },
          }),
        ]
      : []),
    ...(arrowIds.length
      ? [
          prisma.arrow.updateMany({
            where: { id: { in: arrowIds } },
            data: { trashedAt: now },
          }),
        ]
      : []),
    ...(headingIds.length
      ? [
          prisma.heading.updateMany({
            where: { id: { in: headingIds } },
            data: { trashedAt: now },
          }),
        ]
      : []),
    ...(fileIds.length
      ? [
          prisma.boardFile.updateMany({
            where: { id: { in: fileIds } },
            data: { trashedAt: now },
          }),
        ]
      : []),
    ...(tableIds.length
      ? [
          prisma.boardTable.updateMany({
            where: { id: { in: tableIds } },
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
  const noteIds = items.filter((i) => i.type === "note").map((i) => i.id);
  const linkIds = items.filter((i) => i.type === "link").map((i) => i.id);
  const arrowIds = items.filter((i) => i.type === "arrow").map((i) => i.id);
  const headingIds = items.filter((i) => i.type === "heading").map((i) => i.id);
  const fileIds = items.filter((i) => i.type === "file").map((i) => i.id);
  const tableIds = items.filter((i) => i.type === "table").map((i) => i.id);

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
    ...(noteIds.length
      ? [
          prisma.note.updateMany({
            where: { id: { in: noteIds } },
            data: { trashedAt: null },
          }),
        ]
      : []),
    ...(linkIds.length
      ? [
          prisma.link.updateMany({
            where: { id: { in: linkIds } },
            data: { trashedAt: null },
          }),
        ]
      : []),
    ...(arrowIds.length
      ? [
          prisma.arrow.updateMany({
            where: { id: { in: arrowIds } },
            data: { trashedAt: null },
          }),
        ]
      : []),
    ...(headingIds.length
      ? [
          prisma.heading.updateMany({
            where: { id: { in: headingIds } },
            data: { trashedAt: null },
          }),
        ]
      : []),
    ...(fileIds.length
      ? [
          prisma.boardFile.updateMany({
            where: { id: { in: fileIds } },
            data: { trashedAt: null },
          }),
        ]
      : []),
    ...(tableIds.length
      ? [
          prisma.boardTable.updateMany({
            where: { id: { in: tableIds } },
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
  const noteIds = items.filter((i) => i.type === "note").map((i) => i.id);
  const linkIds = items.filter((i) => i.type === "link").map((i) => i.id);
  const arrowIds = items.filter((i) => i.type === "arrow").map((i) => i.id);
  const headingIds = items.filter((i) => i.type === "heading").map((i) => i.id);
  const fileIds = items.filter((i) => i.type === "file").map((i) => i.id);
  const tableIds = items.filter((i) => i.type === "table").map((i) => i.id);

  // Order: drawings → documents → notes → cards → lists.
  // Lists last so their cascade can't kill a card row we already removed.
  await prisma.$transaction([
    ...(drawingIds.length
      ? [prisma.drawing.deleteMany({ where: { id: { in: drawingIds } } })]
      : []),
    ...(docIds.length
      ? [prisma.document.deleteMany({ where: { id: { in: docIds } } })]
      : []),
    ...(noteIds.length
      ? [prisma.note.deleteMany({ where: { id: { in: noteIds } } })]
      : []),
    ...(linkIds.length
      ? [prisma.link.deleteMany({ where: { id: { in: linkIds } } })]
      : []),
    ...(arrowIds.length
      ? [prisma.arrow.deleteMany({ where: { id: { in: arrowIds } } })]
      : []),
    ...(headingIds.length
      ? [prisma.heading.deleteMany({ where: { id: { in: headingIds } } })]
      : []),
    ...(fileIds.length
      ? [prisma.boardFile.deleteMany({ where: { id: { in: fileIds } } })]
      : []),
    ...(tableIds.length
      ? [prisma.boardTable.deleteMany({ where: { id: { in: tableIds } } })]
      : []),
    ...(cardIds.length
      ? [prisma.card.deleteMany({ where: { id: { in: cardIds } } })]
      : []),
    ...(listIds.length
      ? [prisma.list.deleteMany({ where: { id: { in: listIds } } })]
      : []),
  ]);

  await Promise.all(fileIds.map((id) => removeStoredFile(id)));

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
            w: src.w,
            h: src.h,
          },
        });
        for (let i = 0; i < src.cards.length; i++) {
          await tx.card.create({
            data: {
              title: src.cards[i].title,
              description: src.cards[i].description,
              image: src.cards[i].image,
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
            title: src.title ? `${src.title} (copy)` : src.title,
            description: src.description,
            image: src.image,
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
      } else if (item.type === "link") {
        const src = await tx.link.findUnique({ where: { id: item.id } });
        if (!src) continue;
        await tx.link.create({
          data: {
            boardId: src.boardId,
            url: src.url,
            title: src.title,
            description: src.description,
            image: src.image,
            icon: src.icon,
            x: src.x + 28,
            y: src.y + 28,
            w: src.w,
            h: src.h,
          },
        });
      } else if (item.type === "arrow") {
        const src = await tx.arrow.findUnique({ where: { id: item.id } });
        if (!src) continue;
        await tx.arrow.create({
          data: {
            boardId: src.boardId,
            x1: src.x1 + 28,
            y1: src.y1 + 28,
            x2: src.x2 + 28,
            y2: src.y2 + 28,
            fromType: "",
            fromId: "",
            fromSide: "",
            toType: "",
            toId: "",
            toSide: "",
          },
        });
      } else if (item.type === "table") {
        const src = await tx.boardTable.findUnique({ where: { id: item.id } });
        if (!src) continue;
        await tx.boardTable.create({
          data: {
            boardId: src.boardId,
            x: src.x + 28,
            y: src.y + 28,
            cols: src.cols,
            rows: src.rows,
            cells: src.cells,
          },
        });
      } else if (item.type === "file") {
        const src = await tx.boardFile.findUnique({ where: { id: item.id } });
        if (!src) continue;
        const copy = await tx.boardFile.create({
          data: {
            boardId: src.boardId,
            name: src.name,
            mime: src.mime,
            size: src.size,
            kind: src.kind,
            x: src.x + 28,
            y: src.y + 28,
          },
        });
        await copyStoredFile(src.id, copy.id);
      } else if (item.type === "heading") {
        const src = await tx.heading.findUnique({ where: { id: item.id } });
        if (!src) continue;
        await tx.heading.create({
          data: {
            boardId: src.boardId,
            text: src.text,
            x: src.x + 28,
            y: src.y + 28,
            w: src.w,
            h: src.h,
            fontSize: src.fontSize,
            color: src.color,
            bold: src.bold,
            align: src.align,
          },
        });
      } else if (item.type === "note") {
        const src = await tx.note.findUnique({ where: { id: item.id } });
        if (!src) continue;
        await tx.note.create({
          data: {
            boardId: src.boardId,
            text: src.text,
            x: src.x + 28,
            y: src.y + 28,
            w: src.w,
            h: src.h,
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