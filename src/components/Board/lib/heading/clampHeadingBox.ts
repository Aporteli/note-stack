import {
  HEADING_MAX_H,
  HEADING_MAX_W,
  HEADING_MIN_H,
  HEADING_MIN_W,
} from "@/components/Board/lib/heading/size";

export function clampHeadingBox(w: number, h: number) {
  return {
    w: Math.min(HEADING_MAX_W, Math.max(HEADING_MIN_W, Math.round(w))),
    h: Math.min(HEADING_MAX_H, Math.max(HEADING_MIN_H, Math.round(h))),
  };
}
