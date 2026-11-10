export type NoteRecord = {
  id: string;
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z?: number;
  locked?: boolean;
};

export type NoteData = NoteRecord & {
  /** Stable while a placeholder id is replaced by the saved id. */
  key: string;
  fresh: boolean;
};

export const NEW_NOTE_DRAG_ID = "board-new-note-drag";
