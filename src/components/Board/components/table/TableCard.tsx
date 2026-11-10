"use client";

import { TableCell } from "@/components/Board/components/table/TableCell";
import { TableResizeHandle } from "@/components/Board/components/table/TableResizeHandle";
import { useTableResize } from "@/components/Board/hooks/useTableResize";
import { cellKey } from "@/components/Board/lib/table/cellKey";
import { columnName } from "@/components/Board/lib/table/columnName";
import { COL_HEAD, GUTTER, tableHeight, tableWidth } from "@/components/Board/lib/table/metrics";
import type { TableCells, TableData } from "@/components/Board/types/table";

type Props = {
  table: TableData;
  boardId: string;
  selected: boolean;
  dragOffset: { dx: number; dy: number } | null;
  onStartDrag: (id: string, clientX: number, clientY: number) => void;
  onResize: (id: string, cols: number, rows: number) => void;
  onCells: (id: string, cells: TableCells) => void;
};

export function TableCard({ table, boardId, selected, dragOffset, onStartDrag, onResize, onCells }: Props) {
  const dragging = dragOffset !== null;
  const dx = dragOffset ? Math.max(-table.x, dragOffset.dx) : 0;
  const dy = dragOffset ? Math.max(-table.y, dragOffset.dy) : 0;
  const startResize = useTableResize({
    boardId,
    tableId: table.id,
    cols: table.cols,
    rows: table.rows,
    onResize,
  });
  const columns = Array.from({ length: table.cols }, (_, index) => index);
  const rowIndexes = Array.from({ length: table.rows }, (_, index) => index);

  function edit(col: number, row: number, value: string) {
    onCells(table.id, { ...table.cells, [cellKey(col, row)]: value });
  }

  return (
    <div
      data-item-type="table"
      data-item-id={table.id}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        const target = event.target;
        if (target instanceof Element && target.closest("[data-table-edit], [data-table-resize]")) return;
        event.stopPropagation();
        onStartDrag(table.id, event.clientX, event.clientY);
      }}
      className={`absolute border-2 border-slate-800 bg-white ${selected ? "outline outline-2 outline-slate-900" : ""}`}
      style={{
        left: table.x,
        top: table.y,
        width: tableWidth(table.cols),
        height: tableHeight(table.rows),
        zIndex: dragging ? 80 : selected ? 42 : 30,
        touchAction: "none",
        cursor: dragging ? "grabbing" : "grab",
        ...(dragging ? { transform: `translate3d(${dx}px, ${dy}px, 0)` } : null),
      }}
    >
      <div
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `${GUTTER}px repeat(${table.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `${COL_HEAD}px repeat(${table.rows}, minmax(0, 1fr))`,
        }}
      >
      <div className="border-b border-slate-300 bg-white" />
      {columns.map((col) => (
        <div
          key={`h-${col}`}
          className="flex items-center justify-center border-b border-l border-slate-300 text-[11px] text-slate-400"
        >
          {columnName(col)}
        </div>
      ))}
      {rowIndexes.map((row) => (
        <div key={`r-${row}`} className="contents">
          <div className="flex items-center justify-center border-b border-slate-300 text-[11px] text-slate-400">
            {row + 1}
          </div>
          {columns.map((col) => (
            <TableCell
              key={cellKey(col, row)}
              value={table.cells[cellKey(col, row)] ?? ""}
              header={row === 0}
              onChange={(value) => edit(col, row, value)}
            />
          ))}
        </div>
      ))}
      </div>
      <TableResizeHandle onResizeStart={startResize} />
    </div>
  );
}
