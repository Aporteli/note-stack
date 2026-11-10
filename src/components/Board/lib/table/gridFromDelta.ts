import { clampCount } from "@/components/Board/lib/table/clampCount";
import { COL_W, MAX_COLS, MAX_ROWS, MIN_COLS, MIN_ROWS, ROW_H } from "@/components/Board/lib/table/metrics";

export function gridFromDelta(cols: number, rows: number, dx: number, dy: number) {
  return {
    cols: clampCount(cols + dx / COL_W, MIN_COLS, MAX_COLS),
    rows: clampCount(rows + dy / ROW_H, MIN_ROWS, MAX_ROWS),
  };
}
