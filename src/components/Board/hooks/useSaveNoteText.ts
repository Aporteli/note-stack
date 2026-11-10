"use client";

import { useEffect, useRef } from "react";
import { updateNoteText } from "@/app/notes/updateNoteText";
import { isTempId } from "@/components/Board/lib/items";

export function useSaveNoteText(boardId: string, noteId: string, text: string) {
  const saved = useRef<string | null>(null);
  const textRef = useRef(text);
  const sawTemp = useRef(false);
  textRef.current = text;

  useEffect(() => {
    if (isTempId(noteId)) {
      sawTemp.current = true;
      return;
    }
    if (!sawTemp.current && saved.current === null) {
      saved.current = text;
      return;
    }
    if (saved.current === text) return;

    const handle = window.setTimeout(() => {
      saved.current = text;
      void updateNoteText(noteId, boardId, text);
    }, 400);

    return () => window.clearTimeout(handle);
  }, [boardId, noteId, text]);

  return function flush() {
    const value = textRef.current;
    if (isTempId(noteId) || saved.current === value) return;
    saved.current = value;
    void updateNoteText(noteId, boardId, value);
  };
}
