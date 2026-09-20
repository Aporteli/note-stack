"use client";

import { useEffect, useState } from "react";
import type {
  DocumentContent,
  DocumentData,
  DocumentRecord,
} from "@/components/Board/types/board";

function parse(records: DocumentRecord[]): DocumentData[] {
  return records.map((r) => {
    let parsed: DocumentContent = { text: "", strokes: [] };
    try {
      const raw = JSON.parse(r.content);
      parsed = {
        text: typeof raw.text === "string" ? raw.text : "",
        strokes: Array.isArray(raw.strokes) ? raw.strokes : [],
      };
    } catch {
      /* keep defaults */
    }
    return {
      id: r.id,
      title: r.title,
      text: parsed.text,
      strokes: parsed.strokes,
      x: r.x,
      y: r.y,
    };
  });
}

export function useDocuments(initial: DocumentRecord[]) {
  const [documents, setDocuments] = useState<DocumentData[]>(() =>
    parse(initial),
  );

  useEffect(() => {
    setDocuments(parse(initial));
  }, [initial]);

  return [documents, setDocuments] as const;
}