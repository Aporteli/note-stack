import type { PointerEvent, RefObject } from "react";
import { DOC_CANVAS_W } from "@/components/Board/types/board";
import type { Stroke } from "@/components/Board/types/board";
import type { Tool } from "@/components/Board/lib/sketch";
import { InkSurface } from "@/components/Board/components/document/InkSurface";

type Shared = {
  pageH: number;
  textRef: RefObject<HTMLTextAreaElement | null>;
  svgRef: RefObject<SVGSVGElement | null>;
  text: string;
  strokes: Stroke[];
  current: Stroke | null;
  tool: Tool;
  onText: (value: string) => void;
  onPointerDown: (event: PointerEvent) => void;
  onPointerMove: (event: PointerEvent) => void;
  onPointerUp: () => void;
};

export function DocumentWritePage({
  pageH,
  textRef,
  svgRef,
  text,
  strokes,
  current,
  tool,
  onText,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: Shared) {
  return (
    <div className="ns-scroll min-h-0 flex-1 overflow-auto bg-white">
      <div className="relative" style={{ width: DOC_CANVAS_W, height: pageH }}>
        <textarea
          ref={textRef}
          value={text}
          onChange={(event) => onText(event.target.value)}
          placeholder="Start writing…"
          readOnly={tool !== "type"}
          className="absolute inset-0 h-full w-full resize-none border-0 bg-transparent p-6 text-[15px] leading-7 text-slate-800 focus:outline-none"
          style={{ pointerEvents: tool === "type" ? "auto" : "none" }}
        />
        <InkSurface
          svgRef={svgRef}
          width={DOC_CANVAS_W}
          height={pageH}
          strokes={strokes}
          current={current}
          tool={tool}
          className="absolute inset-0"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />
      </div>
    </div>
  );
}

export function DocumentSketchPage({
  pageH,
  svgRef,
  strokes,
  current,
  tool,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: Shared) {
  return (
    <div className="ns-scroll min-h-0 flex-1 overflow-auto bg-slate-50/60">
      <div className="px-4 py-4">
        <InkSurface
          svgRef={svgRef}
          width={DOC_CANVAS_W}
          height={pageH}
          strokes={strokes}
          current={current}
          tool={tool}
          className="rounded-xl border border-slate-200 bg-white shadow-inner"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />
      </div>
    </div>
  );
}
