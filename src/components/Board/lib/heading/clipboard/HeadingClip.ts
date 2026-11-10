import type { HeadingAlign } from "@/components/Board/types/heading";

export type HeadingClip = {
  cut: boolean;
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
  color: string;
  bold: boolean;
  align: HeadingAlign;
};

let clip: HeadingClip | null = null;

export function writeHeadingClip(value: HeadingClip) {
  clip = value;
}

export function readHeadingClip() {
  return clip;
}

export function clearCutHeading() {
  if (clip?.cut) clip = null;
}
