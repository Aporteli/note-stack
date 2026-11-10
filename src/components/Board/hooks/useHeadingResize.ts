"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { resizeHeading } from "@/app/headings/resizeHeading";
import { clampHeadingBox } from "@/components/Board/lib/heading/clampHeadingBox";
import { isTempId } from "@/components/Board/lib/items";

type Args = {
  boardId: string;
  headingId: string;
  width: number;
  height: number;
  onResize: (id: string, w: number, h: number) => void;
};

export function useHeadingResize({ boardId, headingId, width, height, onResize }: Args) {
  function startResize(event: ReactPointerEvent) {
    event.stopPropagation();
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const startW = width;
    const startH = height;

    const sizeAt = (ev: PointerEvent) => clampHeadingBox(startW + ev.clientX - startX, startH + ev.clientY - startY);

    const onMove = (ev: PointerEvent) => {
      const next = sizeAt(ev);
      onResize(headingId, next.w, next.h);
    };

    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove, true);
      window.removeEventListener("pointerup", onUp, true);
      window.removeEventListener("pointercancel", onUp, true);
      const next = sizeAt(ev);
      onResize(headingId, next.w, next.h);
      if (!isTempId(headingId)) void resizeHeading(headingId, next.w, next.h, boardId);
    };

    window.addEventListener("pointermove", onMove, true);
    window.addEventListener("pointerup", onUp, true);
    window.addEventListener("pointercancel", onUp, true);
  }

  return startResize;
}
