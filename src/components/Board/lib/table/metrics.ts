export const COL_W = 112;
export const ROW_H = 32;
export const GUTTER = 36;
export const COL_HEAD = 28;
export const TABLE_COLS = 4;
export const TABLE_ROWS = 7;
export const MIN_COLS = 1;
export const MIN_ROWS = 1;
export const MAX_COLS = 26;
export const MAX_ROWS = 40;

export function tableWidth(cols: number) {
  return GUTTER + cols * COL_W;
}

export function tableHeight(rows: number) {
  return COL_HEAD + rows * ROW_H;
}
