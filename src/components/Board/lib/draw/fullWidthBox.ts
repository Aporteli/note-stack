export function fullWidthBox(drawingW: number, drawingH: number, paneW: number, paneH: number) {
  if (paneW < 1 || paneH < 1) return { x: 0, y: 0, w: drawingW, h: drawingH };
  const viewW = Math.max(drawingW, (drawingH * paneW) / paneH);
  return { x: (drawingW - viewW) / 2, y: 0, w: viewW, h: drawingH };
}
