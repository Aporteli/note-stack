export function dropPoint(canvas: HTMLElement, clientX: number, clientY: number) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.max(0, clientX - rect.left),
    y: Math.max(0, clientY - rect.top),
  };
}
