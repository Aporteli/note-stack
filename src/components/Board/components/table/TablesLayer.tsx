import { TableCard } from "@/components/Board/components/table/TableCard";
import type { TableCells, TableData } from "@/components/Board/types/table";

type Drag = { dx: number; dy: number; id: string };

type Props = {
  boardId: string;
  tables: TableData[];
  selectedItemKeys: Set<string>;
  tableDrag: Drag | null;
  onStartDrag: (id: string, clientX: number, clientY: number) => void;
  onResize: (id: string, cols: number, rows: number) => void;
  onCells: (id: string, cells: TableCells) => void;
};

export function TablesLayer({ boardId, tables, selectedItemKeys, tableDrag, onStartDrag, onResize, onCells }: Props) {
  return tables.map((table) => (
    <TableCard
      key={table.key}
      table={table}
      boardId={boardId}
      selected={selectedItemKeys.has(`table:${table.id}`)}
      dragOffset={tableDrag?.id === table.id ? { dx: tableDrag.dx, dy: tableDrag.dy } : null}
      onStartDrag={onStartDrag}
      onResize={onResize}
      onCells={onCells}
    />
  ));
}
