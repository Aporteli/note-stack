"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { useSaveNoteText } from "@/components/Board/hooks/useSaveNoteText";

type Props = {
  boardId: string;
  noteId: string;
  text: string;
  fresh: boolean;
  editorRef: RefObject<HTMLTextAreaElement | null>;
  onText: (text: string) => void;
};

export function NoteEditor({ boardId, noteId, text, fresh, editorRef, onText }: Props) {
  const flush = useSaveNoteText(boardId, noteId, text);
  const focused = useRef(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!fresh || focused.current) return;
    focused.current = true;
    editorRef.current?.focus();
  }, [editorRef, fresh]);

  return (
    <textarea
      ref={editorRef}
      value={text}
      placeholder="Double-click to type"
      aria-label="Note"
      readOnly={!editing}
      onChange={(event) => onText(event.target.value)}
      onFocus={() => setEditing(true)}
      onBlur={() => {
        setEditing(false);
        flush();
      }}
      onPointerDown={(event) => {
        if (editing || document.activeElement === event.currentTarget) {
          event.stopPropagation();
          return;
        }
        event.preventDefault();
      }}
      className={`
        min-h-0 w-full flex-1 resize-none bg-transparent
        text-[15px] leading-6 text-slate-800 outline-none
        placeholder:text-slate-400
        ${editing ? "cursor-text" : "cursor-[inherit]"}
      `}
    />
  );
}
