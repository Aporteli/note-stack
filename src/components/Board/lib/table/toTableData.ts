import { parseCells } from "@/components/Board/lib/table/parseCells";
import { TABLE_COLS, TABLE_ROWS } from "@/components/Board/lib/table/metrics";
import type { TableData, TableRecord } from "@/components/Board/types/table";

export function toTableData(record: TableRecord): TableData {
  return {
    id: record.id,
    key: record.id,
    x: record.x,
    y: record.y,
    cols: record.cols || TABLE_COLS,
    rows: record.rows || TABLE_ROWS,
    cells: parseCells(record.cells),
  };
}
