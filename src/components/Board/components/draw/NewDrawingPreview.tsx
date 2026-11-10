import { DRAW_H, DRAW_W } from "@/components/Board/lib/draw/size";

export function NewDrawingPreview() {
  return (
    <div
      className="flex items-center justify-center border-2 border-slate-800 bg-white text-sm text-slate-400 shadow-lift-3"
      style={{ width: DRAW_W, height: DRAW_H }}
    >
      Drop to draw
    </div>
  );
}
