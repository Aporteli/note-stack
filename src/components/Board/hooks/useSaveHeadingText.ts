"use client";

import { useEffect, useRef } from "react";
import { updateHeadingText } from "@/app/headings/updateHeadingText";
import { isTempId } from "@/components/Board/lib/items";

export function useSaveHeadingText(boardId: string, headingId: string, text: string) {
  const saved = useRef<string | null>(null);
  const textRef = useRef(text);
  const sawTemp = useRef(false);
  textRef.current = text;

  useEffect(() => {
    if (isTempId(headingId)) {
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
      void updateHeadingText(headingId, boardId, text);
    }, 400);

    return () => window.clearTimeout(handle);
  }, [boardId, headingId, text]);

  return function flush() {
    const value = textRef.current;
    if (isTempId(headingId) || saved.current === value) return;
    saved.current = value;
    void updateHeadingText(headingId, boardId, value);
  };
}
