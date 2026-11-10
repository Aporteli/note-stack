"use client";

import { useDraggable } from "@dnd-kit/core";
import { useState } from "react";
import { renameBoard } from "@/app/actions";
import { IconDescription, IconPlus } from "@/components/ui/Icons";
import {
  NEW_DOCUMENT_DRAG_ID,
  NEW_LIST_DRAG_ID,
} from "@/components/Board/types/board";
import { FormatToolbar } from "@/components/Board/components/document/FormatToolbar";
import { useBoardTools } from "@/components/Board/components/document/boardTools";
import { DrawButton } from "@/components/Board/components/draw/DrawButton";
import { ArrowButton } from "@/components/Board/components/arrow/ArrowButton";
import { LinkButton } from "@/components/Board/components/link/LinkButton";
import { FileButton } from "@/components/Board/components/file/FileButton";
import { HeadingButton } from "@/components/Board/components/heading/HeadingButton";
import { TableButton } from "@/components/Board/components/table/TableButton";
import { NoteButton } from "@/components/Board/components/note/NoteButton";
import { TrashMenu } from "./TrashMenu";

type Props = {
  boardId: string;
  title: string;
  addListOpen: boolean;
  onAddList: () => void;
  refreshKey: number;
  documentOpen: boolean;
  drawingOpen: boolean;
  onUpload: (files: FileList) => void;
};

export function BoardHeader({
  boardId,
  title,
  addListOpen,
  onAddList,
  refreshKey,
  documentOpen,
  drawingOpen,
  onUpload,
}: Props) {
  const { setHost } = useBoardTools();
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

  if (drawingOpen) return null;

  return (
    <div className="relative z-20 shrink-0 border-b border-ink/10 bg-paper">
    {documentOpen ? null : (
    <div className="flex h-12 items-center gap-2 px-3 sm:px-6">
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
        <NoteButton />
        <HeadingButton />
        <TableButton />
        <LinkButton />
        <ArrowButton />
        <FileButton onFiles={onUpload} />
        <DrawButton />

        {/* Document — draggable */}
        <button
          ref={setDocRef}
          {...docListeners}
          {...docAttributes}
          type="button"
          aria-label="New document — drag onto the board"
          title="Drag onto the board to create a document"
          className="
            group inline-flex h-9 items-center gap-1.5
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
            group inline-flex h-9 items-center gap-1.5
            bg-white px-3 text-sm font-medium text-slate-700
            shadow-sm ring-1 ring-slate-200
            transition-all duration-150
            hover:bg-slate-50 hover:shadow
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

        <TrashMenu boardId={boardId} refreshKey={refreshKey} />
      </div>
    </div>
    )}
      {documentOpen ? (
        <div className="ns-scroll flex min-h-11 items-center overflow-x-auto px-2 py-1 sm:px-4">
          <FormatToolbar hint="Switch to Write to format text" />
          <div ref={setHost} className="flex items-center" />
        </div>
      ) : null}
    </div>
  );
}