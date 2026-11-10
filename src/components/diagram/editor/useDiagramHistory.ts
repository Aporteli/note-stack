"use client";

import { useCallback, useRef, useState } from "react";
import type { DiagramDocument } from "@/components/diagram/types";

const HISTORY_LIMIT = 80;

export function useDiagramHistory(
  document: DiagramDocument,
  onDocument: (next: DiagramDocument) => void,
) {
  const past = useRef<DiagramDocument[]>([]);
  const future = useRef<DiagramDocument[]>([]);
  const armed = useRef<DiagramDocument | null>(null);
  const docRef = useRef(document);
  docRef.current = document;
  const [marks, setMarks] = useState({ undo: false, redo: false });

  const refresh = useCallback(() => {
    setMarks({ undo: past.current.length > 0, redo: future.current.length > 0 });
  }, []);

  const push = useCallback(
    (snapshot: DiagramDocument) => {
      past.current = [...past.current, snapshot].slice(-HISTORY_LIMIT);
      future.current = [];
      refresh();
    },
    [refresh],
  );

  const commit = useCallback(
    (next: DiagramDocument) => {
      if (next === docRef.current) return;
      if (!armed.current) push(docRef.current);
      docRef.current = next;
      onDocument(next);
    },
    [onDocument, push],
  );

  const arm = useCallback(() => {
    if (!armed.current) armed.current = docRef.current;
  }, []);

  const settle = useCallback(() => {
    if (!armed.current) return;
    if (armed.current !== docRef.current) push(armed.current);
    armed.current = null;
  }, [push]);

  const undo = useCallback(() => {
    const previous = past.current[past.current.length - 1];
    if (!previous) return;
    past.current = past.current.slice(0, -1);
    future.current = [...future.current, docRef.current];
    docRef.current = previous;
    onDocument(previous);
    refresh();
  }, [onDocument, refresh]);

  const redo = useCallback(() => {
    const next = future.current[future.current.length - 1];
    if (!next) return;
    future.current = future.current.slice(0, -1);
    past.current = [...past.current, docRef.current];
    docRef.current = next;
    onDocument(next);
    refresh();
  }, [onDocument, refresh]);

  return { commit, arm, settle, undo, redo, canUndo: marks.undo, canRedo: marks.redo };
}
