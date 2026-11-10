"use client";

import { useCallback, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { moveLink } from "@/app/links/moveLink";
import { isTempId } from "@/components/Board/lib/items";
import type { LinkData } from "@/components/Board/types/link";

type Args = {
  boardId: string;
  links: LinkData[];
  setLinks: Dispatch<SetStateAction<LinkData[]>>;
  selectedItemKeys: Set<string>;
  setSelectedItemKeys: Dispatch<SetStateAction<Set<string>>>;
};

export type LinkDragState = {
  dx: number;
  dy: number;
  ids: ReadonlySet<string>;
};

export function useLinkDrag({ boardId, links, setLinks, selectedItemKeys, setSelectedItemKeys }: Args) {
  const activeRef = useRef(false);
  const [drag, setDrag] = useState<LinkDragState | null>(null);

  const startDrag = useCallback(
    (id: string, clientX: number, clientY: number, shift: boolean) => {
      if (shift || activeRef.current) return;
      const key = `link:${id}`;
      const wasSelected = selectedItemKeys.has(key);
      const effectiveSelection = wasSelected ? new Set(selectedItemKeys) : new Set([key]);
      if (!wasSelected) setSelectedItemKeys(effectiveSelection);

      const startPositions = new Map<string, { x: number; y: number }>();
      for (const link of links) {
        if (effectiveSelection.has(`link:${link.id}`)) {
          startPositions.set(link.id, { x: link.x, y: link.y });
        }
      }
      if (startPositions.size === 0) return;

      activeRef.current = true;
      const ids = new Set(startPositions.keys());
      let moved = false;
      let finished = false;
      let lastDx = 0;
      let lastDy = 0;

      const onMove = (event: PointerEvent) => {
        const dx = event.clientX - clientX;
        const dy = event.clientY - clientY;
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

        setLinks((prev) =>
          prev.map((link) => {
            const start = startPositions.get(link.id);
            if (!start) return link;
            return {
              ...link,
              x: Math.max(0, start.x + lastDx),
              y: Math.max(0, start.y + lastDy),
            };
          }),
        );

        for (const [sid, start] of startPositions) {
          if (isTempId(sid)) continue;
          void moveLink(sid, Math.max(0, start.x + lastDx), Math.max(0, start.y + lastDy), boardId);
        }
      };

      window.addEventListener("pointermove", onMove, true);
      window.addEventListener("pointerup", onUp, true);
      window.addEventListener("pointercancel", onUp, true);
    },
    [boardId, links, selectedItemKeys, setLinks, setSelectedItemKeys],
  );

  return { startDrag, drag };
}
