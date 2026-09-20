"use client";

import { useEffect, useState } from "react";
import type {
  DrawingData,
  DrawingRecord,
} from "@/components/Board/types/board";

function parse(records: DrawingRecord[]): DrawingData[] {
  return records.map((r) => {
    let strokes: DrawingData["strokes"] = [];
    try {
      strokes = JSON.parse(r.strokes);
    } catch {
      strokes = [];
    }
    return { id: r.id, x: r.x, y: r.y, w: r.w, h: r.h, strokes };
  });
}

export function useDrawings(initial: DrawingRecord[]) {
  const [drawings, setDrawings] = useState<DrawingData[]>(() => parse(initial));

  useEffect(() => {
    setDrawings(parse(initial));
  }, [initial]);

  return [drawings, setDrawings] as const;
}