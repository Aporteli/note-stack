import type { Stroke } from "@/components/Board/types/board";

export type DrawingClip = {
  cut: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  strokes: Stroke[];
};

let clip: DrawingClip | null = null;

export function writeDrawingClip(value: DrawingClip) {
  clip = value;
}

export function readDrawingClip() {
  return clip;
}

export function clearCutDrawing() {
  if (clip?.cut) clip = null;
}
