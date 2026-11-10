import { drawingSvg } from "@/components/Board/components/draw/menu/drawingSvg";
import type { DrawingData } from "@/components/Board/types/board";

export function downloadDrawing(drawing: DrawingData) {
  const blob = new Blob([drawingSvg(drawing)], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "drawing.svg";
  link.click();
  URL.revokeObjectURL(url);
}
