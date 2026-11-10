"use client";

import { useRef } from "react";
import { saveTableCells } from "@/app/tables/saveTableCells";
import { isTempId } from "@/components/Board/lib/items";
import type { TableCells } from "@/components/Board/types/table";

export function useSaveTableCells(boardId: string) {
  const timers = useRef(new Map<string, number>());

  return (id: string, cells: TableCells) => {
    const prev = timers.current.get(id);
    if (prev) window.clearTimeout(prev);
    timers.current.set(
      id,
      window.setTimeout(() => {
        timers.current.delete(id);
        if (!isTempId(id)) void saveTableCells(id, boardId, cells);
      }, 400),
    );
  };
}
