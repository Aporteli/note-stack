"use client";

import { useCallback, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { moveDrawings } from "@/app/actions";
import { isTempId } from "@/components/Board/lib/items";
import type { DrawingData } from "@/components/Board/types/board";

type Args = {
  boardId: string;
  drawings: DrawingData[];
  setDrawings: Dispatch<SetStateAction<DrawingData[]>>;
  selectedDrawingIds: Set<string>;
  setSelectedDrawingIds: Dispatch<SetStateAction<Set<string>>>;
  setSelectedItemKeys: Dispatch<SetStateAction<Set<string>>>;
};

export function useDrawingDrag({
  boardId,
  drawings,
  setDrawings,
  selectedDrawingIds,
  setSelectedDrawingIds,
  setSelectedItemKeys,
}: Args) {
  const drawingsRef = useRef(drawings);
  drawingsRef.current = drawings;
  const [draggingDrawings, setDraggingDrawings] = useState(false);

  const startDrag = useCallback(
    (id: string, clientX: number, clientY: number, shift: boolean) => {
      const origin = drawingsRef.current.find((drawing) => drawing.id === id);
      if (origin?.locked) return;

      let nextSelection: Set<string>;
      if (shift) {
        nextSelection = new Set(selectedDrawingIds);
        if (nextSelection.has(id)) nextSelection.delete(id);
        else nextSelection.add(id);
      } else if (selectedDrawingIds.has(id)) {
        nextSelection = selectedDrawingIds;
      } else {
        nextSelection = new Set([id]);
      }
      setSelectedDrawingIds(nextSelection);
      setSelectedItemKeys(
        new Set(Array.from(nextSelection).map((drawingId) => `drawing:${drawingId}`)),
      );

      if (!nextSelection.has(id)) return;

      const startPositions = new Map<string, { x: number; y: number }>();
      for (const drawing of drawingsRef.current) {
        if (nextSelection.has(drawing.id) && !drawing.locked) {
          startPositions.set(drawing.id, { x: drawing.x, y: drawing.y });
        }
      }

      const startX = clientX;
      const startY = clientY;
      let moved = false;
      setDraggingDrawings(true);

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (!moved && Math.abs(dx) + Math.abs(dy) > 3) moved = true;
        if (!moved) return;
        setDrawings((prev) =>
          prev.map((drawing) => {
            const start = startPositions.get(drawing.id);
            if (!start) return drawing;
            return {
              ...drawing,
              x: Math.max(0, start.x + dx),
              y: Math.max(0, start.y + dy),
            };
          }),
        );
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        setDraggingDrawings(false);
        if (!moved) return;

        const moves = Array.from(startPositions.keys())
          .map((sid) => {
            const drawing = drawingsRef.current.find((item) => item.id === sid);
            return drawing ? { id: drawing.id, x: drawing.x, y: drawing.y } : null;
          })
          .filter((move): move is { id: string; x: number; y: number } => move !== null)
          .filter((move) => !isTempId(move.id));

        if (moves.length === 0) return;
        void moveDrawings(moves, boardId);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [boardId, selectedDrawingIds, setDrawings, setSelectedDrawingIds, setSelectedItemKeys],
  );

  return { draggingDrawings, startDrag };
}
