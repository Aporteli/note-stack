"use client";

import { createPortal } from "react-dom";
import { useDocumentSketch } from "@/components/Board/hooks/useDocumentSketch";
import type { DocumentData, Stroke } from "@/components/Board/types/board";
import { DrawToolbar } from "@/components/Board/components/document/DrawToolbar";
import { DocumentModalFooter } from "@/components/Board/components/document/DocumentModalFooter";
import { DocumentModalHeader } from "@/components/Board/components/document/DocumentModalHeader";
import { DocumentSketchPage, DocumentWritePage } from "@/components/Board/components/document/DocumentPages";
import { DocumentToolsBar } from "@/components/Board/components/document/DocumentToolsBar";

type Props = {
  document: DocumentData | null;
  onSave: (payload: { title: string; text: string; strokes: Stroke[] }) => void;
  onClose: () => void;
};

/** Renamed `document` → `doc` in destructuring so the global `document`
 *  (used for the portal target) stays accessible. */
export function DocumentModal({ document: doc, onSave, onClose }: Props) {
  const sketch = useDocumentSketch(doc, onClose);

  if (!doc || typeof window === "undefined") return null;

  function handleSave() {
    onSave({ title: sketch.title.trim() || "Untitled", text: sketch.text, strokes: sketch.strokes });
  }

  return createPortal(
    <div className="fixed inset-0 z-[180] flex items-center justify-center p-2 sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={sketch.title || "Document"}
        className="relative flex h-[92vh] w-[96vw] max-w-[1400px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <DocumentModalHeader
          title={sketch.title}
          tab={sketch.tab}
          onTitle={sketch.setTitle}
          onWrite={sketch.showWrite}
          onSketch={sketch.showSketch}
          onClose={onClose}
        />

        <div className="relative flex min-h-0 flex-1 flex-col">
          <DocumentToolsBar
            tab={sketch.tab}
            toolsOpen={sketch.toolsOpen}
            onToggle={sketch.toggleTools}
            toolbar={
              <DrawToolbar
                tool={sketch.tool}
                showType={sketch.tab === "write"}
                color={sketch.color}
                thickness={sketch.thickness}
                canUndo={sketch.canUndo}
                canClear={sketch.strokes.length > 0}
                drawing={sketch.drawing}
                onTool={sketch.chooseTool}
                onColor={(value) => {
                  sketch.setColor(value);
                  if (sketch.tool === "eraser") sketch.chooseTool("pen");
                }}
                onThickness={sketch.setThickness}
                onUndo={sketch.undo}
                onClear={sketch.clearSketch}
              />
            }
          />

          {sketch.tab === "write" ? (
            <DocumentWritePage
              pageH={sketch.pageH}
              textRef={sketch.textRef}
              svgRef={sketch.svgRef}
              text={sketch.text}
              strokes={sketch.strokes}
              current={sketch.current}
              tool={sketch.tool}
              onText={sketch.setText}
              onPointerDown={sketch.handlePointerDown}
              onPointerMove={sketch.handlePointerMove}
              onPointerUp={sketch.handlePointerUp}
            />
          ) : (
            <DocumentSketchPage
              pageH={sketch.pageH}
              textRef={sketch.textRef}
              svgRef={sketch.svgRef}
              text={sketch.text}
              strokes={sketch.strokes}
              current={sketch.current}
              tool={sketch.tool}
              onText={sketch.setText}
              onPointerDown={sketch.handlePointerDown}
              onPointerMove={sketch.handlePointerMove}
              onPointerUp={sketch.handlePointerUp}
            />
          )}
        </div>

        <DocumentModalFooter onClose={onClose} onSave={handleSave} />
      </div>
    </div>,
    document.body,
  );
}
