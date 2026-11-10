"use client";

import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { mergeDocuments } from "@/components/Board/lib/document/mergeDocuments";
import { noteRemoved, withoutPending } from "@/components/Board/lib/keepRemoved";
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
      z: r.z,
      locked: r.locked,
    };
  });
}

export function useDocuments(initial: DocumentRecord[]) {
  const [documents, setDocumentsState] = useState<DocumentData[]>(() => parse(initial));

  const setDocuments: Dispatch<SetStateAction<DocumentData[]>> = useCallback((action) => {
    setDocumentsState((current) => {
      const next = typeof action === "function" ? action(current) : action;
      noteRemoved(current, next);
      return next;
    });
  }, []);

  useEffect(() => {
    const incoming = parse(initial);
    setDocumentsState((current) => withoutPending(mergeDocuments(current, incoming)));
  }, [initial]);

  return [documents, setDocuments] as const;
}