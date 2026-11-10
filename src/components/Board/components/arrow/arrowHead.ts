export function arrowHead(x1: number, y1: number, x2: number, y2: number) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 12;
  const left = angle + Math.PI * 0.82;
  const right = angle - Math.PI * 0.82;
  return `${x2},${y2} ${x2 + Math.cos(left) * size},${y2 + Math.sin(left) * size} ${x2 + Math.cos(right) * size},${y2 + Math.sin(right) * size}`;
}
