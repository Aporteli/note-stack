"use client";

import { useRef } from "react";
import { useDocumentMenu } from "@/components/Board/components/document/menu/useDocumentMenu";
import { bandZ } from "@/components/Board/components/itemMenu/bandZ";
import { plainText } from "@/components/Board/lib/richText";
import type { DocumentData } from "@/components/Board/types/board";
import { IconDescription, IconPencil } from "@/components/ui/Icons";

type Props = {
  boardId: string;
  document: DocumentData;
  selected: boolean;
  dragOffset: { dx: number; dy: number } | null;
  onOpen: (id: string) => void;
  onStartDrag: (
    id: string,
    clientX: number,
    clientY: number,
    shift: boolean,
  ) => void;
  onDelete: (id: string) => void;
  onCreated: (document: DocumentData) => void;
  onLock: (id: string, locked: boolean) => void;
  onFront: () => void;
  onBack: () => void;
  onSelect: () => void;
};

const CARD_W = 280;
const CARD_H = 200;

function preview(text: string): string {
  const cleaned = plainText(text).replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  return cleaned.length > 160 ? cleaned.slice(0, 160) + "…" : cleaned;
}

export function DocumentCard({
  boardId,
  document,
  selected,
  dragOffset,
  onOpen,
  onStartDrag,
  onDelete,
  onCreated,
  onLock,
  onFront,
  onBack,
  onSelect,
}: Props) {
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const dragging = dragOffset !== null;
  const dx = dragOffset ? Math.max(-document.x, dragOffset.dx) : 0;
  const dy = dragOffset ? Math.max(-document.y, dragOffset.dy) : 0;

  const style: React.CSSProperties = {
    position: "absolute",
    left: document.x,
    top: document.y,
    width: CARD_W,
    height: CARD_H,
    zIndex: bandZ(32, 44, 70, document.z, selected, dragging),
    cursor: document.locked ? "default" : dragging ? "grabbing" : "grab",
    touchAction: "none",
    userSelect: "none",
    ...(dragging
      ? { transform: `translate3d(${dx}px, ${dy}px, 0)`, willChange: "transform" }
      : null),
  };

  const menu = useDocumentMenu({
    document,
    boardId,
    selected,
    onSelect,
    onDelete,
    onCreated,
    onLock,
    onFront,
    onBack,
  });

  return (
    <div
      style={style}
      data-item-type="document"
      data-item-id={document.id}
      onContextMenu={menu.onContextMenu}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (e.button !== 0 || document.locked) return;
        startRef.current = { x: e.clientX, y: e.clientY };
        onStartDrag(document.id, e.clientX, e.clientY, e.shiftKey);
      }}
      onDoubleClick={(e) => {
        if (e.shiftKey) return;
        const start = startRef.current;
        const movedX = start ? e.clientX - start.x : 0;
        const movedY = start ? e.clientY - start.y : 0;
        if (Math.abs(movedX) + Math.abs(movedY) < 5) {
          e.stopPropagation();
          onOpen(document.id);
        }
      }}
      className={`
        group flex flex-col overflow-hidden
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
      {menu.menu}
    </div>
  );
}

/** Preview that follows the cursor while dragging the header button. */
export function NewDocumentPreview() {
  return (
    <div className="w-[280px] overflow-hidden border border-slate-200/80 bg-white shadow-lift-3">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-3 py-2">
        <IconDescription size={14} className="text-slate-500" />
        <h3 className="text-[13px] font-semibold text-slate-800">
          New document
        </h3>
      </div>
      <div className="grid h-[120px] place-items-center px-3 py-2">
        <span className="border-2 border-dashed border-slate-300/70 px-3 py-1.5 text-[12px] text-slate-500">
          Drop to create
        </span>
      </div>
    </div>
  );
}

/** Preview that follows the cursor while dragging an existing document. */
export function DocumentDragPreview({ title }: { title: string }) {
  return (
    <div className="w-[280px] overflow-hidden border border-slate-200/80 bg-white shadow-lift-3 rotate-1">
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