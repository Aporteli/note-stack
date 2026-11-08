import { useEffect, useRef, useState } from "react";
import type { PointerEvent, RefObject } from "react";
import { useBoardTools } from "@/components/Board/components/document/boardTools";
import { InkSurface } from "@/components/Board/components/document/InkSurface";
import { plainText, sanitizeHtml, toEditorHtml } from "@/components/Board/lib/richText";
import { DOC_CANVAS_W } from "@/components/Board/types/board";
import type { Stroke } from "@/components/Board/types/board";
import type { Tool } from "@/components/Board/lib/sketch";

type Shared = {
  pageH: number;
  textRef: RefObject<HTMLDivElement | null>;
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
  docId,
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
}: Shared & { docId: string }) {
  const { bindEditor } = useBoardTools();
  const [session, setSession] = useState(() => ({
    docId,
    echo: text,
    markup: { __html: toEditorHtml(text) },
  }));
  const publishRef = useRef<() => void>(() => {});

  if (session.docId !== docId || session.echo !== text) {
    const next = toEditorHtml(text);
    if (session.docId !== docId || next !== session.markup.__html) {
      setSession({ docId, echo: text, markup: { __html: next } });
    }
  }

  useEffect(() => {
    publishRef.current = () => {
      const clean = sanitizeHtml(textRef.current?.innerHTML ?? "");
      setSession((current) =>
        current.echo === clean ? current : { ...current, echo: clean },
      );
      onText(clean);
    };
  }, [onText, textRef]);

  useEffect(() => {
    bindEditor(textRef.current, () => publishRef.current());
    return () => bindEditor(null, () => {});
  }, [bindEditor, textRef]);

  return (
    <div className="ns-scroll min-h-0 flex-1 overflow-auto bg-white">
      <div className="relative" style={{ width: DOC_CANVAS_W, height: pageH }}>
        {plainText(text) === "" ? (
          <span className="pointer-events-none absolute top-6 left-6 text-[15px] leading-7 text-slate-400">
            Start writing…
          </span>
        ) : null}
        <div
          ref={textRef}
          role="textbox"
          aria-multiline="true"
          aria-label="Document text"
          contentEditable
          suppressContentEditableWarning
          spellCheck
          dir="auto"
          dangerouslySetInnerHTML={session.markup}
          onInput={() => publishRef.current()}
          onPaste={(event) => {
            event.preventDefault();
            const html = event.clipboardData.getData("text/html");
            const pasted = event.clipboardData.getData("text/plain");
            const clean = html
              ? sanitizeHtml(html)
              : pasted
                  .replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/\n/g, "<br>");
            document.execCommand("insertHTML", false, clean);
            publishRef.current();
          }}
          className="absolute inset-0 h-full w-full cursor-text overflow-hidden border-0 bg-transparent p-6 text-[15px] leading-7 break-words whitespace-pre-wrap text-slate-800 focus:outline-none [&_h1]:font-display [&_h1]:text-[2rem] [&_h1]:leading-tight [&_h1]:font-semibold [&_h2]:font-display [&_h2]:text-[1.5rem] [&_h2]:leading-snug [&_h2]:font-semibold [&_h3]:text-[1.25rem] [&_h3]:font-semibold [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-6"
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
