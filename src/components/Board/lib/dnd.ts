import type {
  DocumentData,
  DrawingData,
  ListData,
  Position,
} from "@/components/Board/types/board";

/* -------------------- CARD POSITION -------------------- */

export function findCardPosition(
  lists: ListData[],
  cardId: string,
): Position | null {
  for (let listIndex = 0; listIndex < lists.length; listIndex++) {
    const cardIndex = lists[listIndex].cards.findIndex((c) => c.id === cardId);
    if (cardIndex !== -1) return { listIndex, cardIndex };
  }
  return null;
}

/* -------------------- DROP TARGET -------------------- */

export function findDropTarget(
  lists: ListData[],
  overId: string,
): Position | null {
  for (let listIndex = 0; listIndex < lists.length; listIndex++) {
    if (lists[listIndex].id === overId) {
      return { listIndex, cardIndex: lists[listIndex].cards.length };
    }
    const cardIndex = lists[listIndex].cards.findIndex((c) => c.id === overId);
    if (cardIndex !== -1) return { listIndex, cardIndex };
  }
  return null;
}

/* -------------------- CARD MOVE -------------------- */

export function moveCardInLists(
  lists: ListData[],
  source: Position,
  target: Position,
  cardId: string,
): { lists: ListData[]; targetIndex: number; targetListId: string } | null {
  if (
    source.listIndex === target.listIndex &&
    source.cardIndex === target.cardIndex
  ) {
    return null;
  }

  const next = structuredClone(lists);
  const [moved] = next[source.listIndex].cards.splice(source.cardIndex, 1);

  const targetIndex =
    source.listIndex === target.listIndex &&
    source.cardIndex < target.cardIndex
      ? target.cardIndex - 1
      : target.cardIndex;

  next[target.listIndex].cards.splice(targetIndex, 0, moved);

  return {
    lists: next,
    targetIndex,
    targetListId: next[target.listIndex].id,
  };
}

/* -------------------- CANVAS BOUNDS -------------------- */

type BoundsOptions = {
  minWidth?: number;
  minHeight?: number;
  pad?: number;
};

const DOC_CARD_W = 280;
const DOC_CARD_H = 200;

export function canvasBounds(
  lists: ListData[],
  drawings: DrawingData[] = [],
  documents: DocumentData[] = [],
  opts: BoundsOptions = {},
) {
  const LIST_W = 296;
  const LIST_H = 480;

  const { minWidth = 1200, minHeight = 800, pad = 240 } = opts;

  let maxX = minWidth;
  let maxY = minHeight;

  for (const list of lists) {
    maxX = Math.max(maxX, list.x + LIST_W);
    maxY = Math.max(maxY, list.y + LIST_H);
  }
  for (const d of drawings) {
    maxX = Math.max(maxX, d.x + d.w);
    maxY = Math.max(maxY, d.y + d.h);
  }
  for (const d of documents) {
    maxX = Math.max(maxX, d.x + DOC_CARD_W);
    maxY = Math.max(maxY, d.y + DOC_CARD_H);
  }

  return { width: maxX + pad, height: maxY + pad };
}