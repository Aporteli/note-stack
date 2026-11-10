"use client";

import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { resizeList } from "@/app/actions";
import { clampListHeight, clampListWidth } from "@/components/Board/lib/list/size";

type Args = {
  boardId: string;
  listId: string;
  width: number;
  height: number;
  nodeRef: RefObject<HTMLElement | null>;
  onResize?: (id: string, w: number, h: number) => void;
  onResizing: (resizing: boolean) => void;
};

export function useListResize({
  boardId,
  listId,
  width,
  height,
  nodeRef,
  onResize,
  onResizing,
}: Args) {
  const resizingRef = useRef(false);

  function startResize(event: ReactPointerEvent<HTMLElement>) {
    event.stopPropagation();
    event.preventDefault();
    resizingRef.current = true;
    onResizing(true);
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    const bounds = nodeRef.current?.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startW = bounds?.width || width;
    const startH = bounds?.height || height;

    const sizeAt = (ev: PointerEvent) => ({
      w: clampListWidth(startW + ev.clientX - startX),
      h: clampListHeight(startH + ev.clientY - startY),
    });

    let finished = false;
    const end = (ev: PointerEvent) => {
      if (finished) return;
      finished = true;
      window.removeEventListener("pointermove", onMove, true);
      window.removeEventListener("pointerup", end, true);
      window.removeEventListener("pointercancel", end, true);
      resizingRef.current = false;
      onResizing(false);
      if (handle.hasPointerCapture(ev.pointerId)) {
        handle.releasePointerCapture(ev.pointerId);
      }
      const next = sizeAt(ev);
      onResize?.(listId, next.w, next.h);
      void resizeList(listId, next.w, next.h, boardId);
    };

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== event.pointerId) return;
      if (ev.buttons === 0) {
        end(ev);
        return;
      }
      const next = sizeAt(ev);
      onResize?.(listId, next.w, next.h);
    };

    window.addEventListener("pointermove", onMove, true);
    window.addEventListener("pointerup", end, true);
    window.addEventListener("pointercancel", end, true);
  }

  return { startResize, resizingRef };
}
