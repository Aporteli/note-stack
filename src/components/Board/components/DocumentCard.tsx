"use client";

import { useRef } from "react";
import type { DocumentData } from "@/components/Board/types/board";
import { IconDescription, IconPencil } from "@/components/ui/Icons";

type Props = {
  document: DocumentData;
  selected: boolean;
  onOpen: (id: string) => void;
  onStartDrag: (
    id: string,
    clientX: number,
    clientY: number,
    shift: boolean,
  ) => void;
};

const CARD_W = 280;
const CARD_H = 200;

function preview(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  return cleaned.length > 160 ? cleaned.slice(0, 160) + "…" : cleaned;
}

export function DocumentCard({
  document,
  selected,
  onOpen,
  onStartDrag,
}: Props) {
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const style: React.CSSProperties = {
    position: "absolute",
    left: document.x,
    top: document.y,
    width: CARD_W,
    height: CARD_H,
    zIndex: selected ? 44 : 32,
    touchAction: "none",
    userSelect: "none",
    cursor: "grab",
  };

  return (
    <div
      style={style}
      data-item-type="document"
      data-item-id={document.id}
      onPointerDown={(e) => {
        e.stopPropagation();
        startRef.current = { x: e.clientX, y: e.clientY };
        onStartDrag(document.id, e.clientX, e.clientY, e.shiftKey);
      }}
      onClick={(e) => {
        /* Shift-click toggles selection — the canvas handles that.
           Don't also open the modal. */
        if (e.shiftKey) return;

        const start = startRef.current;
        startRef.current = null;
        const dx = start ? e.clientX - start.x : 99;
        const dy = start ? e.clientY - start.y : 99;

        if (Math.abs(dx) + Math.abs(dy) < 5) {
          e.stopPropagation();
          onOpen(document.id);
        }
      }}
      className={`
        group flex flex-col overflow-hidden rounded-xl
        border border-slate-200/80 bg-white shadow-md shadow-slate-900/5
        transition-shadow hover:shadow-lg
        ${
          selected
            ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent"
            : ""
        }
      `}
    >
      {/* Header strip */}
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-3 py-2">
        <IconDescription size={14} className="text-slate-500" />
        <h3 className="min-w-0 flex-1 truncate text-[13px] font-semibold text-slate-800">
          {document.title || "Untitled"}
        </h3>
        {document.strokes.length > 0 && (
          <IconPencil size={13} className="text-slate-400" />
        )}
      </div>

      {/* Body */}
      <div className="ns-scroll flex-1 overflow-hidden px-3 py-2">
        {preview(document.text) ? (
          <p className="whitespace-pre-wrap text-[12.5px] leading-5 text-slate-600">
            {preview(document.text)}
          </p>
        ) : (
          <p className="text-[12.5px] italic leading-5 text-slate-400">
            Empty document — click to edit
          </p>
        )}
      </div>

      {/* Footer hint */}
      <div className="border-t border-slate-100 px-3 py-1.5 text-[10.5px] uppercase tracking-wider text-slate-400">
        Document
      </div>
    </div>
  );
}

/** Preview that follows the cursor while dragging the header button. */
export function NewDocumentPreview() {
  return (
    <div className="w-[280px] overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-lift-3">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-3 py-2">
        <IconDescription size={14} className="text-slate-500" />
        <h3 className="text-[13px] font-semibold text-slate-800">
          New document
        </h3>
      </div>
      <div className="grid h-[120px] place-items-center px-3 py-2">
        <span className="rounded-md border-2 border-dashed border-slate-300/70 px-3 py-1.5 text-[12px] text-slate-500">
          Drop to create
        </span>
      </div>
    </div>
  );
}

/** Preview that follows the cursor while dragging an existing document. */
export function DocumentDragPreview({ title }: { title: string }) {
  return (
    <div className="w-[280px] overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-lift-3 rotate-1">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-3 py-2">
        <IconDescription size={14} className="text-slate-500" />
        <h3 className="truncate text-[13px] font-semibold text-slate-800">
          {title || "Untitled"}
        </h3>
      </div>
      <div className="h-[100px]" />
    </div>
  );
}