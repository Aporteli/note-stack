import type { ArrowRecord } from "@/components/Board/types/arrow";
import type { FileRecord } from "@/components/Board/types/boardFile";
import type { TableRecord } from "@/components/Board/types/table";
import type { HeadingRecord } from "@/components/Board/types/heading";
import type { LinkRecord } from "@/components/Board/types/link";
import type { NoteRecord } from "@/components/Board/types/note";

export type CardData = {
  id: string;
  title: string;
  image?: string | null;
};

export type ListData = {
  id: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z?: number;
  locked?: boolean;
  cards: CardData[];
};

export type StrokePoint = [number, number];

/** Missing `kind` means a freehand pen stroke (older saved documents). */
export type StrokeKind = "pen" | "line" | "rect" | "ellipse";

export type Stroke = {
  color: string;
  width: number;
  points: StrokePoint[];
  kind?: StrokeKind;
};

export type DrawingRecord = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  strokes: string;
  z?: number;
  locked?: boolean;
};

export type DrawingData = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  strokes: Stroke[];
  z?: number;
  locked?: boolean;
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
  z?: number;
  locked?: boolean;
};

export type DocumentData = {
  id: string;
  title: string;
  text: string;
  strokes: Stroke[];
  x: number;
  y: number;
  z?: number;
  locked?: boolean;
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
  notes: NoteRecord[];
  links: LinkRecord[];
  arrows: ArrowRecord[];
  headings: HeadingRecord[];
  files: FileRecord[];
  tables: TableRecord[];
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
  | "new-document"
  | "new-note"
  | "new-drawing"
  | "new-link"
  | "new-arrow"
  | "new-heading"
  | "new-table";

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
export const NEW_DRAWING_DRAG_ID = "board-new-drawing-drag";

/* -------------------- Trash -------------------- */

export type ItemType =
  | "list"
  | "card"
  | "drawing"
  | "document"
  | "note"
  | "link"
  | "arrow"
  | "heading"
  | "file"
  | "table";

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
  notes: TrashItem[];
  links: TrashItem[];
  arrows: TrashItem[];
  headings: TrashItem[];
  files: TrashItem[];
  tables: TrashItem[];
};

export function itemKey(item: ItemRef): string {
  return `${item.type}:${item.id}`;
}