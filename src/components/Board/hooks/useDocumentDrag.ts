"use client";

import { useCallback, useRef } from "react";
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

export function useDocumentDrag({
  boardId,
  documents,
  setDocuments,
  selectedItemKeys,
  setSelectedItemKeys,
}: Args) {
  const documentsRef = useRef(documents);
  documentsRef.current = documents;

  return useCallback(
    (id: string, clientX: number, clientY: number, shift: boolean) => {
      /* Shift is a selection gesture, not a drag.
         The canvas click handler owns the toggle. */
      if (shift) return;

      const key = `document:${id}`;
      const wasSelected = selectedItemKeys.has(key);
      const effectiveSelection = wasSelected
        ? new Set(selectedItemKeys)
        : new Set([key]);

      if (!wasSelected) setSelectedItemKeys(effectiveSelection);

      const startPositions = new Map<string, { x: number; y: number }>();
      for (const doc of documentsRef.current) {
        if (effectiveSelection.has(`document:${doc.id}`)) {
          startPositions.set(doc.id, { x: doc.x, y: doc.y });
        }
      }
      if (startPositions.size === 0) return;

      const startX = clientX;
      const startY = clientY;
      let moved = false;

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (!moved && Math.abs(dx) + Math.abs(dy) > 3) moved = true;
        if (!moved) return;

        setDocuments((prev) =>
          prev.map((doc) => {
            const start = startPositions.get(doc.id);
            if (!start) return doc;
            return {
              ...doc,
              x: Math.max(0, start.x + dx),
              y: Math.max(0, start.y + dy),
            };
          }),
        );
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        if (!moved) return;

        for (const sid of startPositions.keys()) {
          if (isTempId(sid)) continue;
          const doc = documentsRef.current.find((item) => item.id === sid);
          if (doc) void moveDocumentPosition(sid, doc.x, doc.y, boardId);
        }
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [boardId, selectedItemKeys, setDocuments, setSelectedItemKeys],
  );
}
