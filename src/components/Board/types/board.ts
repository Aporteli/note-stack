export type CardData = {
  id: string;
  title: string;
};

export type ListData = {
  id: string;
  title: string;
  x: number;
  y: number;
  cards: CardData[];
};

export type StrokePoint = [number, number];

export type Stroke = {
  color: string;
  width: number;
  points: StrokePoint[];
};

export type DrawingRecord = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  strokes: string;
};

export type DrawingData = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  strokes: Stroke[];
};

/* -------------------- Documents -------------------- */

export type DocumentContent = {
  text: string;
  strokes: Stroke[];
};

export type DocumentRecord = {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
};

export type DocumentData = {
  id: string;
  title: string;
  text: string;
  strokes: Stroke[];
  x: number;
  y: number;
};

/** Fixed drawing surface inside the document modal. */
export const DOC_CANVAS_W = 1200;
export const DOC_CANVAS_H = 800;

export type BoardData = {
  id: string;
  title: string;
  lists: ListData[];
  drawings: DrawingRecord[];
  documents: DocumentRecord[];
};

export type Position = {
  listIndex: number;
  cardIndex: number;
};

export type DragType =
  | "card"
  | "list"
  | "new-list"
  | "document"
  | "new-document";

export type ListDragData = {
  type: "list";
  x: number;
  y: number;
};

export type DocumentDragData = {
  type: "document";
  x: number;
  y: number;
};

export const NEW_LIST_DRAG_ID = "board-new-list-drag";
export const NEW_DOCUMENT_DRAG_ID = "board-new-document-drag";

/* -------------------- Trash -------------------- */

export type ItemType = "list" | "card" | "drawing" | "document";

export type ItemRef = {
  type: ItemType;
  id: string;
};

export type TrashItem = ItemRef & {
  title: string;
  trashedAt: string;
  listTitle?: string;
};

export type TrashBundle = {
  lists: TrashItem[];
  cards: TrashItem[];
  drawings: TrashItem[];
  documents: TrashItem[];
};

export function itemKey(item: ItemRef): string {
  return `${item.type}:${item.id}`;
}