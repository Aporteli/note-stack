export const LIST_W = 296;
export const LIST_H = 320;
export const LIST_MIN_W = 220;
export const LIST_MIN_H = 160;
export const LIST_MAX_W = 720;
export const LIST_MAX_H = 900;

export function clampListWidth(size: number) {
  return Math.min(LIST_MAX_W, Math.max(LIST_MIN_W, Math.round(size)));
}

export function clampListHeight(size: number) {
  return Math.min(LIST_MAX_H, Math.max(LIST_MIN_H, Math.round(size)));
}
