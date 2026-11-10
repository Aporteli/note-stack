export function clampCount(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}
