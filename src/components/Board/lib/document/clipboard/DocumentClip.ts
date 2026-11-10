import type { Stroke } from "@/components/Board/types/board";

export type DocumentClip = {
  cut: boolean;
  title: string;
  text: string;
  strokes: Stroke[];
  x: number;
  y: number;
};

let clip: DocumentClip | null = null;

export function writeDocumentClip(value: DocumentClip) {
  clip = value;
}

export function readDocumentClip() {
  return clip;
}

export function clearCutDocument() {
  if (clip?.cut) clip = null;
}
