export function frontZ(lists: { z?: number }[]) {
  return lists.reduce((max, list) => Math.max(max, list.z ?? 0), 0) + 1;
}
