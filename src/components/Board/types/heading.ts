export type HeadingAlign = "left" | "center" | "right";

export type HeadingRecord = {
  id: string;
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z?: number;
  locked?: boolean;
  fontSize?: number;
  color?: string;
  bold?: boolean;
  align?: string;
};

export type HeadingData = HeadingRecord & {
  key: string;
  fresh: boolean;
};

export const NEW_HEADING_DRAG_ID = "board-new-heading-drag";
