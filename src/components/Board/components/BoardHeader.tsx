"use client";

import { useDraggable } from "@dnd-kit/core";
import { useState } from "react";
import { renameBoard } from "@/app/actions";
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

  const [name, setName] = useState(title);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);

  function commitName() {
    const text = draft.trim();
    setEditing(false);
    if (!text || text === name) return;
    setName(text);
    void renameBoard(boardId, text);
  }

  return (
    <div className="relative z-20 flex h-12 shrink-0 items-center gap-2 border-b border-ink/10 bg-paper px-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        {editing ? (
          <input
            value={draft}
            autoFocus
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitName}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
              if (event.key === "Escape") setEditing(false);
            }}
            aria-label="Board name"
            className="
              max-w-[45vw] rounded-md bg-slate-100 px-1.5 py-1
              text-[15px] font-semibold tracking-[-0.01em] text-slate-900
              outline-none ring-2 ring-slate-300
              sm:max-w-[55vw]
            "
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(name);
              setEditing(true);
            }}
            title="Rename board"
            className="
              max-w-[45vw] truncate rounded-md px-1 py-1 text-left
              text-[15px] font-semibold tracking-[-0.01em] text-slate-900
              hover:bg-slate-100
              sm:max-w-[55vw]
            "
          >
            {name}
          </button>
        )}
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
    </div>
  );
}