"use client";

import { useCallback, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { moveTable } from "@/app/tables/moveTable";
import { isTempId } from "@/components/Board/lib/items";
import type { TableData } from "@/components/Board/types/table";

type Args = {
  boardId: string;
  tables: TableData[];
  setTables: Dispatch<SetStateAction<TableData[]>>;
  setSelectedItemKeys: Dispatch<SetStateAction<Set<string>>>;
};

export type TableDragState = { dx: number; dy: number; id: string };

export function useTableDrag({ boardId, tables, setTables, setSelectedItemKeys }: Args) {
  const activeRef = useRef(false);
  const [drag, setDrag] = useState<TableDragState | null>(null);

  const startDrag = useCallback(
    (id: string, clientX: number, clientY: number) => {
      if (activeRef.current) return;
      const origin = tables.find((table) => table.id === id);
      if (!origin) return;
      setSelectedItemKeys(new Set([`table:${id}`]));
      activeRef.current = true;
      let moved = false;
      let finished = false;
      let lastDx = 0;
      let lastDy = 0;

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - clientX;
        const dy = ev.clientY - clientY;
        if (!moved && Math.abs(dx) + Math.abs(dy) > 3) moved = true;
        if (!moved) return;
        lastDx = dx;
        lastDy = dy;
        setDrag({ dx, dy, id });
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
        const x = Math.max(0, origin.x + lastDx);
        const y = Math.max(0, origin.y + lastDy);
        setTables((prev) => prev.map((table) => (table.id === id ? { ...table, x, y } : table)));
        if (!isTempId(id)) void moveTable(id, x, y, boardId);
      };

      window.addEventListener("pointermove", onMove, true);
      window.addEventListener("pointerup", onUp, true);
      window.addEventListener("pointercancel", onUp, true);
    },
    [boardId, setSelectedItemKeys, setTables, tables],
  );

  return { startDrag, drag };
}
