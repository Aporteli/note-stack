"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useDocumentSketch } from "@/components/Board/hooks/useDocumentSketch";
import type { DocumentData, Stroke } from "@/components/Board/types/board";
import { useBoardTools } from "@/components/Board/components/document/boardTools";
import { DrawToolbar } from "@/components/Board/components/document/DrawToolbar";
import { FormatToolbar } from "@/components/Board/components/document/FormatToolbar";
import { DocumentModalFooter } from "@/components/Board/components/document/DocumentModalFooter";
import { DocumentModalHeader } from "@/components/Board/components/document/DocumentModalHeader";
import { DocumentSketchPage, DocumentWritePage } from "@/components/Board/components/document/DocumentPages";

type Props = {
  document: DocumentData | null;
  onSave: (payload: { title: string; text: string; strokes: Stroke[] }) => void;
  onClose: () => void;
};

/** Renamed `document` → `doc` in destructuring so the global `document`
 *  (used for formatting commands) stays accessible. */
export function DocumentModal({ document: doc, onSave, onClose }: Props) {
  const { host, prepareRef } = useBoardTools();
  const sketch = useDocumentSketch(doc, onClose);

  useEffect(() => {
    prepareRef.current = () => {
      if (sketch.tab !== "write") sketch.showWrite();
      if (sketch.tool !== "type") sketch.chooseTool("type");
    };
  });

  if (!doc || typeof window === "undefined") return null;

  function handleSave() {
    onSave({ title: sketch.title.trim() || "Untitled", text: sketch.text, strokes: sketch.strokes });
  }

  const tools = (
    <div className="flex w-max flex-wrap items-center gap-2">
      <FormatToolbar hint="Switch to Write to format text" />
      <span className="mx-0.5 hidden h-5 w-px shrink-0 bg-slate-200 sm:block" aria-hidden />
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
    </div>
  );

  return (
    <>
      {host ? createPortal(tools, host) : null}
      <div className="absolute inset-0 z-[80] flex flex-col bg-white">
        <DocumentModalHeader
          title={sketch.title}
          tab={sketch.tab}
          onTitle={sketch.setTitle}
          onWrite={sketch.showWrite}
          onSketch={sketch.showSketch}
          onClose={onClose}
        />

        {sketch.tab === "write" ? (
          <DocumentWritePage
            docId={doc.id}
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

        <DocumentModalFooter onClose={onClose} onSave={handleSave} />
      </div>
    </>
  );
}
