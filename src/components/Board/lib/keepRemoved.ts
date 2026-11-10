const hidden = new Set<string>();

/** Remember ids dropped from local state so a stale server refresh cannot put them back. */
export function noteRemoved<T extends { id: string }>(before: T[], after: T[]) {
  const afterIds = new Set(after.map((item) => item.id));
  const beforeIds = new Set(before.map((item) => item.id));
  for (const item of before) {
    if (!afterIds.has(item.id)) hidden.add(item.id);
  }
  for (const id of afterIds) {
    if (!beforeIds.has(id)) hidden.delete(id);
  }
}

/** A restore puts these ids back on the board. */
export function showRemoved(ids: Iterable<string>) {
  for (const id of ids) hidden.delete(id);
}

export function withoutPending<T extends { id: string }>(merged: T[]) {
  return merged.filter((item) => !hidden.has(item.id));
}
