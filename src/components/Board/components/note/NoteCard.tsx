"use client";

import { useEffect, useRef } from "react";
import { bandZ } from "@/components/Board/components/itemMenu/bandZ";
import { NoteEditor } from "@/components/Board/components/note/NoteEditor";
import { useNoteMenu } from "@/components/Board/components/note/menu/useNoteMenu";
import { NoteResizeHandle } from "@/components/Board/components/note/NoteResizeHandle";
import { useNoteResize } from "@/components/Board/hooks/useNoteResize";
import type { NoteData } from "@/components/Board/types/note";

type Props = {
  boardId: string;
  note: NoteData;
  selected: boolean;
  dragOffset: { dx: number; dy: number } | null;
  onText: (id: string, text: string) => void;
  onResize: (id: string, w: number, h: number) => void;
  onStartDrag: (id: string, clientX: number, clientY: number, shift: boolean) => void;
  onDelete: (id: string) => void;
  onCreated: (note: NoteData) => void;
  onLock: (id: string, locked: boolean) => void;
  onFront: () => void;
  onBack: () => void;
  onSelect: () => void;
};

export function NoteCard({
  boardId,
  note,
  selected,
  dragOffset,
  onText,
  onResize,
  onStartDrag,
  onDelete,
  onCreated,
  onLock,
  onFront,
  onBack,
  onSelect,
}: Props) {
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const dragging = dragOffset !== null;
  const startResize = useNoteResize({
    boardId,
    noteId: note.id,
    width: note.w,
    height: note.h,
    onResize,
  });

  useEffect(() => {
    if (dragging) editorRef.current?.blur();
  }, [dragging]);
  const dx = dragOffset ? Math.max(-note.x, dragOffset.dx) : 0;
  const dy = dragOffset ? Math.max(-note.y, dragOffset.dy) : 0;
  const menu = useNoteMenu({
    note,
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
      data-item-type="note"
      data-item-id={note.id}
      onContextMenu={menu.onContextMenu}
      onPointerDown={(event) => {
        event.stopPropagation();
        if (event.button !== 0 || note.locked || event.shiftKey) return;
        startRef.current = { x: event.clientX, y: event.clientY };
        onStartDrag(note.id, event.clientX, event.clientY, event.shiftKey);
      }}
      onDoubleClick={(event) => {
        if (event.shiftKey) return;
        const start = startRef.current;
        const movedX = start ? event.clientX - start.x : 0;
        const movedY = start ? event.clientY - start.y : 0;
        if (Math.abs(movedX) + Math.abs(movedY) < 5) editorRef.current?.focus();
      }}
      className={`
        absolute flex flex-col overflow-hidden border-2 bg-white p-4 shadow-sm
        ${note.locked ? "cursor-default" : ""}
        ${selected ? "border-black" : "border-slate-200"}
      `}
      style={{
        left: note.x,
        top: note.y,
        width: note.w,
        height: note.h,
        zIndex: bandZ(34, 46, 72, note.z, selected, dragging),
        touchAction: "none",
        cursor: note.locked ? "default" : dragging ? "grabbing" : "grab",
        ...(dragging
          ? { transform: `translate3d(${dx}px, ${dy}px, 0)`, willChange: "transform" }
          : null),
      }}
    >
      <NoteEditor
        boardId={boardId}
        noteId={note.id}
        text={note.text}
        fresh={note.fresh}
        editorRef={editorRef}
        onText={(text) => onText(note.id, text)}
      />
      <NoteResizeHandle onResizeStart={startResize} />
      {menu.menu}
    </div>
  );
}
