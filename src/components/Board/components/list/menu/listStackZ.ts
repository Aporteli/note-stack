export function listStackZ(z: number | undefined, selected: boolean) {
  const stack = z ?? 0;
  if (stack === 0) return selected ? 45 : 2;
  return 2 + stack;
}
