import { LIST_H, LIST_W } from "@/components/Board/lib/list/size";
import { NOTE_H, NOTE_W } from "@/components/Board/lib/note/size";
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
  notes: { x: number; y: number; w?: number; h?: number }[] = [],
  links: { x: number; y: number; w?: number; h?: number }[] = [],
  arrows: { x1: number; y1: number; x2: number; y2: number }[] = [],
  headings: { x: number; y: number; w?: number; h?: number }[] = [],
  files: { x: number; y: number; kind?: string }[] = [],
  boxes: { x: number; y: number; w: number; h: number }[] = [],
) {
  const { minWidth = 1200, minHeight = 800, pad = 240 } = opts;

  let maxX = minWidth;
  let maxY = minHeight;

  for (const list of lists) {
    maxX = Math.max(maxX, list.x + (list.w || LIST_W));
    maxY = Math.max(maxY, list.y + (list.h || LIST_H));
  }
  for (const d of drawings) {
    maxX = Math.max(maxX, d.x + d.w);
    maxY = Math.max(maxY, d.y + d.h);
  }
  for (const d of documents) {
    maxX = Math.max(maxX, d.x + DOC_CARD_W);
    maxY = Math.max(maxY, d.y + DOC_CARD_H);
  }
  for (const note of notes) {
    maxX = Math.max(maxX, note.x + (note.w || NOTE_W));
    maxY = Math.max(maxY, note.y + (note.h || NOTE_H));
  }
  for (const link of links) {
    maxX = Math.max(maxX, link.x + (link.w || 300));
    maxY = Math.max(maxY, link.y + (link.h || 48));
  }
  for (const arrow of arrows) {
    maxX = Math.max(maxX, arrow.x1, arrow.x2);
    maxY = Math.max(maxY, arrow.y1, arrow.y2);
  }
  for (const heading of headings) {
    maxX = Math.max(maxX, heading.x + (heading.w || 640));
    maxY = Math.max(maxY, heading.y + (heading.h || 96));
  }
  for (const file of files) {
    maxX = Math.max(maxX, file.x + (file.kind === "video" ? 280 : 148));
    maxY = Math.max(maxY, file.y + (file.kind === "audio" || file.kind === "video" ? 240 : 180));
  }
  for (const box of boxes) {
    maxX = Math.max(maxX, box.x + box.w);
    maxY = Math.max(maxY, box.y + box.h);
  }

  return { width: maxX + pad, height: maxY + pad };
}