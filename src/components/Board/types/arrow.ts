export type ArrowSide = "top" | "right" | "bottom" | "left";

export type ArrowRecord = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  fromType: string;
  fromId: string;
  fromSide: string;
  toType: string;
  toId: string;
  toSide: string;
};

export type ArrowData = ArrowRecord;

export const NEW_ARROW_DRAG_ID = "board-new-arrow-drag";
export const ARROW_LENGTH = 180;
