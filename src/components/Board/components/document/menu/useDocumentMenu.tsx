"use client";

import { useEffect, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { ContextMenu } from "@/components/Board/components/ContextMenu";
import { duplicateDocument } from "@/components/Board/components/document/menu/duplicateDocument";
import { lockDocument } from "@/components/Board/components/document/menu/lockDocument";
import { trashDocument } from "@/components/Board/components/document/menu/trashDocument";
import { itemMenuEntries } from "@/components/Board/components/itemMenu/itemMenuEntries";
import { copyDocument } from "@/components/Board/lib/document/clipboard/copyDocument";
import { cutDocument } from "@/components/Board/lib/document/clipboard/cutDocument";
import type { DocumentData } from "@/components/Board/types/board";

type Args = {
  document: DocumentData;
  boardId: string;
  selected: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
  onCreated: (document: DocumentData) => void;
  onLock: (id: string, locked: boolean) => void;
  onFront: () => void;
  onBack: () => void;
};

function typing(event: KeyboardEvent) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export function useDocumentMenu({
  document,
  boardId,
  selected,
  onSelect,
  onDelete,
  onCreated,
  onLock,
  onFront,
  onBack,
}: Args) {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!selected) return;
    function onKey(event: KeyboardEvent) {
      if (typing(event)) return;
      const key = event.key.toLowerCase();
      const command = event.ctrlKey || event.metaKey;
      if (command && key === "c") {
        event.preventDefault();
        copyDocument(document);
      } else if (command && key === "x") {
        event.preventDefault();
        cutDocument(document, boardId, onDelete);
      } else if (command && key === "d") {
        event.preventDefault();
        void duplicateDocument(document, boardId, onCreated);
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [boardId, document, onCreated, onDelete, selected]);

  function onContextMenu(event: ReactMouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    onSelect();
    setAt({ x: event.clientX, y: event.clientY });
  }

  const menu = at ? (
    <ContextMenu
      x={at.x}
      y={at.y}
      onClose={() => setAt(null)}
      items={itemMenuEntries({
        locked: Boolean(document.locked),
        cut: () => cutDocument(document, boardId, onDelete),
        copy: () => copyDocument(document),
        duplicate: () => void duplicateDocument(document, boardId, onCreated),
        trash: () => trashDocument(document.id, boardId, onDelete),
        lock: () => lockDocument(document.id, !document.locked, boardId, onLock),
        front: onFront,
        back: onBack,
      })}
    />
  ) : null;

  return { onContextMenu, menu };
}
