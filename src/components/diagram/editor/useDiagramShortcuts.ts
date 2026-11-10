"use client";

import { useEffect, useRef } from "react";
import { typingTarget } from "@/components/diagram/lib/typingTarget";

type Shortcuts = {
  onUndo: () => void;
  onRedo: () => void;
  onDuplicate: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onBold: () => void;
  onSelectAll: () => void;
};

export function useDiagramShortcuts(shortcuts: Shortcuts) {
  const latest = useRef(shortcuts);
  latest.current = shortcuts;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (typingTarget(event.target)) return;
      const command = event.ctrlKey || event.metaKey;
      if (!command) return;
      const key = event.key.toLowerCase();
      const actions = latest.current;
      if (key === "z" && event.shiftKey) {
        event.preventDefault();
        actions.onRedo();
        return;
      }
      if (key === "z") {
        event.preventDefault();
        actions.onUndo();
        return;
      }
      if (key === "y") {
        event.preventDefault();
        actions.onRedo();
        return;
      }
      if (key === "d") {
        event.preventDefault();
        actions.onDuplicate();
        return;
      }
      if (key === "c") {
        event.preventDefault();
        actions.onCopy();
        return;
      }
      if (key === "v") {
        event.preventDefault();
        actions.onPaste();
        return;
      }
      if (key === "b") {
        event.preventDefault();
        actions.onBold();
        return;
      }
      if (key === "a") {
        event.preventDefault();
        actions.onSelectAll();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
