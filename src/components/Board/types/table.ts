export type TableRecord = {
  id: string;
  x: number;
  y: number;
  cols: number;
  rows: number;
  cells: string;
};

export type TableCells = Record<string, string>;

export type TableData = {
  id: string;
  key: string;
  x: number;
  y: number;
  cols: number;
  rows: number;
  cells: TableCells;
};

export const NEW_TABLE_DRAG_ID = "board-new-table-drag";
