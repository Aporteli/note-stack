import { isTempId } from "@/components/Board/lib/items";
import { toTableData } from "@/components/Board/lib/table/toTableData";
import type { TableData, TableRecord } from "@/components/Board/types/table";

export function mergeTables(local: TableData[], incoming: TableRecord[]): TableData[] {
  const byId = new Map(local.map((table) => [table.id, table]));
  const saved = incoming.map((record) => {
    const existing = byId.get(record.id);
    if (!existing) return toTableData(record);
    return { ...existing, x: existing.x, y: existing.y, cols: existing.cols, rows: existing.rows, cells: existing.cells };
  });
  return [...saved, ...local.filter((table) => isTempId(table.id))];
}
