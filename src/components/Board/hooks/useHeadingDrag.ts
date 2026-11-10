"use client";

import { useCallback, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { moveHeading } from "@/app/headings/moveHeading";
import { isTempId } from "@/components/Board/lib/items";
import type { HeadingData } from "@/components/Board/types/heading";

type Args = {
  boardId: string;
  headings: HeadingData[];
  setHeadings: Dispatch<SetStateAction<HeadingData[]>>;
  selectedItemKeys: Set<string>;
  setSelectedItemKeys: Dispatch<SetStateAction<Set<string>>>;
};

export type HeadingDragState = {
  dx: number;
  dy: number;
  ids: ReadonlySet<string>;
};

export function useHeadingDrag({
  boardId,
  headings,
  setHeadings,
  selectedItemKeys,
  setSelectedItemKeys,
}: Args) {
  const activeRef = useRef(false);
  const [drag, setDrag] = useState<HeadingDragState | null>(null);

  const startDrag = useCallback(
    (id: string, clientX: number, clientY: number, shift: boolean) => {
      if (shift || activeRef.current) return;
      const origin = headings.find((heading) => heading.id === id);
      if (!origin || origin.locked) return;

      const key = `heading:${id}`;
      const wasSelected = selectedItemKeys.has(key);
      const effectiveSelection = wasSelected ? new Set(selectedItemKeys) : new Set([key]);
      if (!wasSelected) setSelectedItemKeys(effectiveSelection);

      const startPositions = new Map<string, { x: number; y: number }>();
      for (const heading of headings) {
        if (effectiveSelection.has(`heading:${heading.id}`) && !heading.locked) {
          startPositions.set(heading.id, { x: heading.x, y: heading.y });
        }
      }
      if (startPositions.size === 0) return;

      activeRef.current = true;
      const ids = new Set(startPositions.keys());
      let moved = false;
      let finished = false;
      let lastDx = 0;
      let lastDy = 0;

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - clientX;
        const dy = ev.clientY - clientY;
        if (!moved && Math.abs(dx) + Math.abs(dy) > 3) moved = true;
        if (!moved || (dx === lastDx && dy === lastDy)) return;
        lastDx = dx;
        lastDy = dy;
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

        setHeadings((prev) =>
          prev.map((heading) => {
            const start = startPositions.get(heading.id);
            if (!start) return heading;
            return {
              ...heading,
              x: Math.max(0, start.x + lastDx),
              y: Math.max(0, start.y + lastDy),
            };
          }),
        );

        for (const [sid, start] of startPositions) {
          if (isTempId(sid)) continue;
          void moveHeading(sid, Math.max(0, start.x + lastDx), Math.max(0, start.y + lastDy), boardId);
        }
      };

      window.addEventListener("pointermove", onMove, true);
      window.addEventListener("pointerup", onUp, true);
      window.addEventListener("pointercancel", onUp, true);
    },
    [boardId, headings, selectedItemKeys, setHeadings, setSelectedItemKeys],
  );

  return { startDrag, drag };
}
