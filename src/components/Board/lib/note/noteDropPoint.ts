export function noteDropPoint(
  pointer: { x: number; y: number },
  grab: { x: number; y: number },
  rect: { left: number; top: number },
): { x: number; y: number } {
  return {
    x: Math.max(0, pointer.x - grab.x - rect.left),
    y: Math.max(0, pointer.y - grab.y - rect.top),
  };
}
