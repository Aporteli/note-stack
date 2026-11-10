import type { Dispatch, SetStateAction } from "react";
import { createTable } from "@/app/tables/createTable";
import { TABLE_COLS, TABLE_ROWS } from "@/components/Board/lib/table/metrics";
import { noteDropPoint } from "@/components/Board/lib/note/noteDropPoint";
import { tempId } from "@/components/Board/lib/note/tempId";
import type { TableData } from "@/components/Board/types/table";

type Args = {
  boardId: string;
  pointer: { x: number; y: number };
  grab: { x: number; y: number };
  canvas: HTMLDivElement;
  setTables: Dispatch<SetStateAction<TableData[]>>;
};

export async function placeNewTable({ boardId, pointer, grab, canvas, setTables }: Args) {
  const point = noteDropPoint(pointer, grab, canvas.getBoundingClientRect());
  const placeholderId = tempId();
  const placeholder: TableData = {
    id: placeholderId,
    key: placeholderId,
    x: point.x,
    y: point.y,
    cols: TABLE_COLS,
    rows: TABLE_ROWS,
    cells: {},
  };
  setTables((prev) => [...prev, placeholder]);

  try {
    const created = await createTable(boardId, point.x, point.y);
    setTables((prev) =>
      prev.map((table) =>
        table.key === placeholderId ? { ...table, id: created.id, x: created.x, y: created.y } : table,
      ),
    );
  } catch (err) {
    setTables((prev) => prev.filter((table) => table.key !== placeholderId));
    console.error("Failed to create table", err);
  }
}
