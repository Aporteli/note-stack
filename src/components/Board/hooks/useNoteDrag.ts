"use client";

import { useCallback, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { moveNote } from "@/app/notes/moveNote";
import { isTempId } from "@/components/Board/lib/items";
import type { NoteData } from "@/components/Board/types/note";

type Args = {
  boardId: string;
  notes: NoteData[];
  setNotes: Dispatch<SetStateAction<NoteData[]>>;
  selectedItemKeys: Set<string>;
  setSelectedItemKeys: Dispatch<SetStateAction<Set<string>>>;
};

export type NoteDragState = {
  dx: number;
  dy: number;
  ids: ReadonlySet<string>;
};

export function useNoteDrag({
  boardId,
  notes,
  setNotes,
  selectedItemKeys,
  setSelectedItemKeys,
}: Args) {
  const activeRef = useRef(false);
  const [drag, setDrag] = useState<NoteDragState | null>(null);

  const startDrag = useCallback(
    (id: string, clientX: number, clientY: number, shift: boolean) => {
      if (shift || activeRef.current) return;
      const origin = notes.find((note) => note.id === id);
      if (!origin || origin.locked) return;

      const key = `note:${id}`;
      const wasSelected = selectedItemKeys.has(key);
      const effectiveSelection = wasSelected ? new Set(selectedItemKeys) : new Set([key]);
      if (!wasSelected) setSelectedItemKeys(effectiveSelection);

      const startPositions = new Map<string, { x: number; y: number }>();
      for (const note of notes) {
        if (effectiveSelection.has(`note:${note.id}`) && !note.locked) {
          startPositions.set(note.id, { x: note.x, y: note.y });
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

        setNotes((prev) =>
          prev.map((note) => {
            const start = startPositions.get(note.id);
            if (!start) return note;
            return {
              ...note,
              x: Math.max(0, start.x + lastDx),
              y: Math.max(0, start.y + lastDy),
            };
          }),
        );

        for (const [sid, start] of startPositions) {
          if (isTempId(sid)) continue;
          void moveNote(sid, Math.max(0, start.x + lastDx), Math.max(0, start.y + lastDy), boardId);
        }
      };

      window.addEventListener("pointermove", onMove, true);
      window.addEventListener("pointerup", onUp, true);
      window.addEventListener("pointercancel", onUp, true);
    },
    [boardId, notes, selectedItemKeys, setNotes, setSelectedItemKeys],
  );

  return { startDrag, drag };
}
