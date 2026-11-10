"use client";

import { useEffect } from "react";
import { typingTarget } from "@/components/diagram/lib/typingTarget";

export function useDiagramKeys(onDelete: () => boolean, onEscape: () => void) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (typingTarget(event.target)) return;
      if (event.key === "Escape") {
        onEscape();
        return;
      }
      if ((event.key === "Delete" || event.key === "Backspace") && onDelete()) {
        event.preventDefault();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDelete, onEscape]);
}
