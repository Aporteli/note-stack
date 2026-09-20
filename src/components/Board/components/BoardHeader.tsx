"use client";

import { useDraggable } from "@dnd-kit/core";
import Link from "next/link";
import {
  IconDescription,
  IconPencil,
  IconPlus,
} from "@/components/ui/Icons";
import {
  NEW_DOCUMENT_DRAG_ID,
  NEW_LIST_DRAG_ID,
} from "@/components/Board/types/board";
import { TrashMenu } from "./TrashMenu";

type Props = {
  boardId: string;
  title: string;
  addListOpen: boolean;
  onAddList: () => void;
  onToggleDraw: () => void;
  drawMode: boolean;
  refreshKey: number;
};

export function BoardHeader({
  boardId,
  title,
  addListOpen,
  onAddList,
  onToggleDraw,
  drawMode,
  refreshKey,
}: Props) {
  const {
    setNodeRef: setListRef,
    listeners: listListeners,
    attributes: listAttributes,
    isDragging: isListDragging,
  } = useDraggable({
    id: NEW_LIST_DRAG_ID,
    data: { type: "new-list" },
  });

  const {
    setNodeRef: setDocRef,
    listeners: docListeners,
    attributes: docAttributes,
    isDragging: isDocDragging,
  } = useDraggable({
    id: NEW_DOCUMENT_DRAG_ID,
    data: { type: "new-document" },
  });

  return (
    <header
      className="
        relative z-20 flex h-14 shrink-0 items-center
        border-b border-slate-200/80
        bg-white/90 px-4
        backdrop-blur-xl
        sm:px-5
      "
    >
      <div className="flex min-w-0 items-center gap-2">
        <Link
          href="/"
          aria-label="Back to boards"
          className="
            group flex h-9 items-center gap-1.5
            rounded-lg px-2.5
            text-sm font-medium text-slate-500
            transition-colors
            hover:bg-slate-100 hover:text-slate-900
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60
          "
        >
          <span
            aria-hidden
            className="text-base leading-none transition-transform duration-200 group-hover:-translate-x-0.5"
          >
            ←
          </span>
          <span className="hidden sm:inline">Boards</span>
        </Link>

        <span aria-hidden className="h-5 w-px bg-slate-200" />

        <h1
          className="
            max-w-[45vw] truncate px-1
            text-[15px] font-semibold tracking-[-0.01em] text-slate-900
            sm:max-w-[55vw]
          "
          title={title}
        >
          {title}
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Draw toggle */}
        <button
          type="button"
          onClick={onToggleDraw}
          aria-pressed={drawMode}
          className={`
            inline-flex h-9 items-center gap-1.5 rounded-lg px-3
            text-sm font-medium shadow-sm transition-all duration-150
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-offset-2 active:scale-[0.98]
            ${
              drawMode
                ? "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500/40"
                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:ring-slate-900/30"
            }
          `}
        >
          <IconPencil size={15} />
          <span>{drawMode ? "Drawing…" : "Draw"}</span>
        </button>

        {/* Trash */}
        <TrashMenu boardId={boardId} refreshKey={refreshKey} />

        {/* Document — draggable */}
        <button
          ref={setDocRef}
          {...docListeners}
          {...docAttributes}
          type="button"
          aria-label="New document — drag onto the board"
          title="Drag onto the board to create a document"
          className="
            group inline-flex h-9 items-center gap-1.5 rounded-lg
            bg-white px-3 text-slate-700 ring-1 ring-slate-200
            text-sm font-medium shadow-sm
            transition-all duration-150
            hover:bg-slate-50 hover:shadow
            active:scale-[0.98]
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-slate-900/30 focus-visible:ring-offset-2
          "
          style={{
            touchAction: "none",
            opacity: isDocDragging ? 0.4 : undefined,
          }}
        >
          <IconDescription size={15} />
          <span>Document</span>
        </button>

        {/* Add list — draggable */}
        <button
          ref={setListRef}
          {...listListeners}
          {...listAttributes}
          type="button"
          onClick={onAddList}
          disabled={addListOpen}
          aria-label="Add list — click to name, or drag onto the board"
          title="Click to name, or drag onto the board"
          className="
            group inline-flex h-9 items-center gap-1.5 rounded-lg
            bg-slate-900 px-3
            text-sm font-medium text-white shadow-sm
            transition-all duration-150
            hover:bg-slate-800 hover:shadow
            active:scale-[0.98]
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-slate-900/30 focus-visible:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-40
          "
          style={{
            touchAction: "none",
            opacity: isListDragging ? 0.4 : undefined,
          }}
        >
          <IconPlus
            size={15}
            className="transition-transform duration-200 group-hover:rotate-90"
          />
          <span>Add list</span>
        </button>
      </div>
    </header>
  );
}