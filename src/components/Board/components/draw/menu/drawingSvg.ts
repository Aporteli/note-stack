import { strokeSvg } from "@/components/Board/components/draw/menu/strokeSvg";
import type { Stroke } from "@/components/Board/types/board";

export function drawingSvg(drawing: { w: number; h: number; strokes: Stroke[] }) {
  const marks = drawing.strokes.map(strokeSvg).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${drawing.w}" height="${drawing.h}" viewBox="0 0 ${drawing.w} ${drawing.h}"><rect width="100%" height="100%" fill="white"/>${marks}</svg>`;
}
