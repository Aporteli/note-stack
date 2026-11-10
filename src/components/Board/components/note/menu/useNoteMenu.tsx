"use client";

import { useEffect, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { ContextMenu } from "@/components/Board/components/ContextMenu";
import { itemMenuEntries } from "@/components/Board/components/itemMenu/itemMenuEntries";
import { duplicateNote } from "@/components/Board/components/note/menu/duplicateNote";
import { lockNote } from "@/components/Board/components/note/menu/lockNote";
import { trashNote } from "@/components/Board/components/note/menu/trashNote";
import { copyNote } from "@/components/Board/lib/note/clipboard/copyNote";
import { cutNote } from "@/components/Board/lib/note/clipboard/cutNote";
import type { NoteData } from "@/components/Board/types/note";

type Args = {
  note: NoteData;
  boardId: string;
  selected: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
  onCreated: (note: NoteData) => void;
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

export function useNoteMenu({
  note,
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
        copyNote(note);
      } else if (command && key === "x") {
        event.preventDefault();
        cutNote(note, boardId, onDelete);
      } else if (command && key === "d") {
        event.preventDefault();
        void duplicateNote(note, boardId, onCreated);
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [boardId, note, onCreated, onDelete, selected]);

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
        locked: Boolean(note.locked),
        cut: () => cutNote(note, boardId, onDelete),
        copy: () => copyNote(note),
        duplicate: () => void duplicateNote(note, boardId, onCreated),
        trash: () => trashNote(note.id, boardId, onDelete),
        lock: () => lockNote(note.id, !note.locked, boardId, onLock),
        front: onFront,
        back: onBack,
      })}
    />
  ) : null;

  return { onContextMenu, menu };
}
