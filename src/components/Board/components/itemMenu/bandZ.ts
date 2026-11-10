export function bandZ(
  base: number,
  selectedBase: number,
  dragBase: number,
  z: number | undefined,
  selected: boolean,
  dragging: boolean,
) {
  if (dragging) return dragBase;
  const stack = z ?? 0;
  if (stack === 0) return selected ? selectedBase : base;
  return base + stack;
}
