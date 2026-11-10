"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { resizeTable } from "@/app/tables/resizeTable";
import { gridFromDelta } from "@/components/Board/lib/table/gridFromDelta";
import { isTempId } from "@/components/Board/lib/items";

type Args = {
  boardId: string;
  tableId: string;
  cols: number;
  rows: number;
  onResize: (id: string, cols: number, rows: number) => void;
};

export function useTableResize({ boardId, tableId, cols, rows, onResize }: Args) {
  function startResize(event: ReactPointerEvent) {
    event.stopPropagation();
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;

    const nextAt = (ev: PointerEvent) => gridFromDelta(cols, rows, ev.clientX - startX, ev.clientY - startY);

    const onMove = (ev: PointerEvent) => {
      const next = nextAt(ev);
      onResize(tableId, next.cols, next.rows);
    };
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove, true);
      window.removeEventListener("pointerup", onUp, true);
      window.removeEventListener("pointercancel", onUp, true);
      const next = nextAt(ev);
      onResize(tableId, next.cols, next.rows);
      if (!isTempId(tableId)) void resizeTable(tableId, next.cols, next.rows, boardId);
    };

    window.addEventListener("pointermove", onMove, true);
    window.addEventListener("pointerup", onUp, true);
    window.addEventListener("pointercancel", onUp, true);
  }

  return startResize;
}
