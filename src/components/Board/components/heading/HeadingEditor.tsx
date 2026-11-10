"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { useSaveHeadingText } from "@/components/Board/hooks/useSaveHeadingText";
import { HEADING_ALIGN, HEADING_COLOR, HEADING_FONT } from "@/components/Board/lib/heading/defaults";
import type { HeadingAlign } from "@/components/Board/types/heading";

type Props = {
  boardId: string;
  headingId: string;
  text: string;
  fresh: boolean;
  fontSize?: number;
  color?: string;
  bold?: boolean;
  align?: string;
  editorRef: RefObject<HTMLInputElement | null>;
  onText: (text: string) => void;
};

function alignOf(value: string | undefined): HeadingAlign {
  if (value === "left" || value === "right" || value === "center") return value;
  return HEADING_ALIGN;
}

export function HeadingEditor({
  boardId,
  headingId,
  text,
  fresh,
  fontSize,
  color,
  bold,
  align,
  editorRef,
  onText,
}: Props) {
  const flush = useSaveHeadingText(boardId, headingId, text);
  const focused = useRef(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!fresh || focused.current) return;
    focused.current = true;
    editorRef.current?.focus();
  }, [editorRef, fresh]);

  return (
    <input
      ref={editorRef}
      value={text}
      placeholder="Start typing..."
      aria-label="Heading"
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
      style={{
        fontSize: fontSize || HEADING_FONT,
        color: color || HEADING_COLOR,
        fontWeight: bold ? 700 : 400,
        textAlign: alignOf(align),
      }}
      className={`
        w-full bg-transparent outline-none placeholder:text-slate-400
        ${editing ? "cursor-text" : "cursor-[inherit]"}
      `}
    />
  );
}
