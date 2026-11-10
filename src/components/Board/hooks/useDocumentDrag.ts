"use client";

import { useCallback, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { moveDocumentPosition } from "@/app/actions";
import { isTempId } from "@/components/Board/lib/items";
import type { DocumentData } from "@/components/Board/types/board";

type Args = {
  boardId: string;
  documents: DocumentData[];
  setDocuments: Dispatch<SetStateAction<DocumentData[]>>;
  selectedItemKeys: Set<string>;
  setSelectedItemKeys: Dispatch<SetStateAction<Set<string>>>;
};

export type DocumentDragState = {
  dx: number;
  dy: number;
  ids: ReadonlySet<string>;
};

export function useDocumentDrag({
  boardId,
  documents,
  setDocuments,
  selectedItemKeys,
  setSelectedItemKeys,
}: Args) {
  const activeRef = useRef(false);
  const [drag, setDrag] = useState<DocumentDragState | null>(null);

  const startDrag = useCallback(
    (id: string, clientX: number, clientY: number, shift: boolean) => {
      /* Shift is a selection gesture, not a drag.
         The canvas click handler owns the toggle. */
      if (shift || activeRef.current) return;
      const origin = documents.find((doc) => doc.id === id);
      if (!origin || origin.locked) return;

      const key = `document:${id}`;
      const wasSelected = selectedItemKeys.has(key);
      const effectiveSelection = wasSelected
        ? new Set(selectedItemKeys)
        : new Set([key]);

      if (!wasSelected) setSelectedItemKeys(effectiveSelection);

      const startPositions = new Map<string, { x: number; y: number }>();
      for (const doc of documents) {
        if (effectiveSelection.has(`document:${doc.id}`) && !doc.locked) {
          startPositions.set(doc.id, { x: doc.x, y: doc.y });
        }
      }
      if (startPositions.size === 0) return;

      activeRef.current = true;
      const ids = new Set(startPositions.keys());
      const startX = clientX;
      const startY = clientY;
      let moved = false;
      let finished = false;
      let lastDx = 0;
      let lastDy = 0;

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (!moved && Math.abs(dx) + Math.abs(dy) > 3) moved = true;
        if (!moved || (dx === lastDx && dy === lastDy)) return;
        lastDx = dx;
        lastDy = dy;
        /* Move with a transform. Writing x/y here resizes the canvas on
           every event, and the scrollport then shifts the card while the
           pointer is still held. */
        setDrag((prev) => (prev ? { ...prev, dx, dy } : { dx, dy, ids }));
      };

      const onUp = () => {
        if (finished) return;
        finished = true;
        window.removeEventListener("pointermove", onMove, true);
        window.removeEventListener("pointerup", onUp, true);
        window.removeEventListener("pointercancel", onUp, true);
        activeRef.current = false;
        setDrag(null);
        if (!moved) return;

        setDocuments((prev) =>
          prev.map((doc) => {
            const start = startPositions.get(doc.id);
            if (!start) return doc;
            return {
              ...doc,
              x: Math.max(0, start.x + lastDx),
              y: Math.max(0, start.y + lastDy),
            };
          }),
        );

        for (const [sid, start] of startPositions) {
          if (isTempId(sid)) continue;
          void moveDocumentPosition(
            sid,
            Math.max(0, start.x + lastDx),
            Math.max(0, start.y + lastDy),
            boardId,
          );
        }
      };

      window.addEventListener("pointermove", onMove, true);
      window.addEventListener("pointerup", onUp, true);
      window.addEventListener("pointercancel", onUp, true);
    },
    [boardId, documents, selectedItemKeys, setDocuments, setSelectedItemKeys],
  );

  return { startDrag, drag };
}
