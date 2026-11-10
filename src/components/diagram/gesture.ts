import type { Corner, ShapeKind, Side } from "@/components/diagram/types";
import type { DiagramShape } from "@/components/diagram/types";

export type DraftLink = {
  fromId: string;
  fromSide: Side;
  x: number;
  y: number;
};

export type Gesture =
  | { type: "pan"; pointerId: number; sx: number; sy: number; ox: number; oy: number }
  | { type: "move"; pointerId: number; origins: DiagramShape[]; startX: number; startY: number }
  | { type: "resize"; pointerId: number; id: string; corner: Corner; box: { x: number; y: number; w: number; h: number } }
  | { type: "connect"; pointerId: number; fromId: string; fromSide: Side }
  | {
      type: "place";
      pointerId: number;
      kind: ShapeKind;
      x: number;
      y: number;
      sx: number;
      sy: number;
      ox: number;
      oy: number;
      panning: boolean;
    };
