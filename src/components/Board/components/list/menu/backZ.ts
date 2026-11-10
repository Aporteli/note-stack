export function backZ(lists: { z?: number }[]) {
  return lists.reduce((min, list) => Math.min(min, list.z ?? 0), 0) - 1;
}
