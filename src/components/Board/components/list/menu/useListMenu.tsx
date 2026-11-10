"use client";

import { useEffect, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { ContextMenu } from "@/components/Board/components/ContextMenu";
import { copyList } from "@/components/Board/lib/list/clipboard/copyList";
import { cutList } from "@/components/Board/lib/list/clipboard/cutList";
import { convertToBoard } from "@/components/Board/components/list/menu/convertToBoard";
import { duplicateThisList } from "@/components/Board/components/list/menu/duplicateThisList";
import { listMenuEntries } from "@/components/Board/components/list/menu/listMenuEntries";
import { lockList } from "@/components/Board/components/list/menu/lockList";
import { pasteIntoList } from "@/components/Board/components/list/menu/pasteIntoList";
import { trashThisList } from "@/components/Board/components/list/menu/trashThisList";
import type { ListData } from "@/components/Board/types/board";

type Card = { id: string; title: string; image?: string | null };

type Args = {
  list: ListData;
  boardId: string;
  selected: boolean;
  onRename: () => void;
  onSelect: () => void;
  onDelete: (id: string) => void;
  onPicture: (listId: string, card: Card) => void;
  onCreated: (list: ListData) => void;
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

export function useListMenu({
  list,
  boardId,
  selected,
  onRename,
  onSelect,
  onDelete,
  onPicture,
  onCreated,
  onLock,
  onFront,
  onBack,
}: Args) {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);

  function paste() {
    void pasteIntoList({ boardId, list, onPicture, onCreated });
  }

  useEffect(() => {
    if (!selected) return;
    function onKey(event: KeyboardEvent) {
      if (typing(event)) return;
      const key = event.key.toLowerCase();
      const command = event.ctrlKey || event.metaKey;
      if (command && key === "c") {
        event.preventDefault();
        copyList(list);
      } else if (command && key === "x") {
        event.preventDefault();
        cutList(list, boardId, onDelete);
      } else if (command && key === "v") {
        event.preventDefault();
        paste();
      } else if (command && key === "d") {
        event.preventDefault();
        void duplicateThisList(list, boardId, onCreated);
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [boardId, list, onCreated, onDelete, onPicture, selected]);

  function onContextMenu(event: ReactMouseEvent) {
    const target = event.target;
    if (target instanceof Element && target.closest("[data-item-type='card']")) return;
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
      items={listMenuEntries({
        locked: Boolean(list.locked),
        paste,
        cut: () => cutList(list, boardId, onDelete),
        copy: () => copyList(list),
        duplicate: () => void duplicateThisList(list, boardId, onCreated),
        trash: () => trashThisList(list.id, boardId, onDelete),
        rename: onRename,
        convert: () => void convertToBoard(list.id, boardId),
        lock: () => lockList(list.id, !list.locked, boardId, onLock),
        front: onFront,
        back: onBack,
      })}
    />
  ) : null;

  return { onContextMenu, menu };
}
