import type { Box } from "@/components/Board/lib/arrow/sidePoint";

export function canvasPoint(canvas: HTMLElement, clientX: number, clientY: number) {
  const root = canvas.getBoundingClientRect();
  return { x: clientX - root.left, y: clientY - root.top };
}

export function measureBox(canvas: HTMLElement, type: string, id: string): Box | null {
  const el = canvas.querySelector(
    `[data-item-type="${CSS.escape(type)}"][data-item-id="${CSS.escape(id)}"]`,
  );
  if (!(el instanceof HTMLElement)) return null;
  const item = el.getBoundingClientRect();
  const root = canvas.getBoundingClientRect();
  return {
    x: item.left - root.left,
    y: item.top - root.top,
    w: item.width,
    h: item.height,
  };
}
