"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { resizeNote } from "@/app/notes/resizeNote";
import { isTempId } from "@/components/Board/lib/items";
import { clampNoteSize } from "@/components/Board/lib/note/clampNoteSize";

type Args = {
  boardId: string;
  noteId: string;
  width: number;
  height: number;
  onResize: (id: string, w: number, h: number) => void;
};

export function useNoteResize({ boardId, noteId, width, height, onResize }: Args) {
  function startResize(event: ReactPointerEvent) {
    event.stopPropagation();
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const startW = width;
    const startH = height;

    const sizeAt = (ev: PointerEvent) => ({
      w: clampNoteSize(startW + ev.clientX - startX),
      h: clampNoteSize(startH + ev.clientY - startY),
    });

    const onMove = (ev: PointerEvent) => {
      const next = sizeAt(ev);
      onResize(noteId, next.w, next.h);
    };

    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove, true);
      window.removeEventListener("pointerup", onUp, true);
      window.removeEventListener("pointercancel", onUp, true);
      const next = sizeAt(ev);
      onResize(noteId, next.w, next.h);
      if (!isTempId(noteId)) void resizeNote(noteId, next.w, next.h, boardId);
    };

    window.addEventListener("pointermove", onMove, true);
    window.addEventListener("pointerup", onUp, true);
    window.addEventListener("pointercancel", onUp, true);
  }

  return startResize;
}
