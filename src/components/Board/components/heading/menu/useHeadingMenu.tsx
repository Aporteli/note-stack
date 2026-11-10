"use client";

import { useEffect, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { ContextMenu } from "@/components/Board/components/ContextMenu";
import { HeadingEditModal } from "@/components/Board/components/heading/edit/HeadingEditModal";
import { duplicateHeading } from "@/components/Board/components/heading/menu/duplicateHeading";
import { headingMenuEntries } from "@/components/Board/components/heading/menu/headingMenuEntries";
import { lockHeading } from "@/components/Board/components/heading/menu/lockHeading";
import { trashHeading } from "@/components/Board/components/heading/menu/trashHeading";
import { copyHeading } from "@/components/Board/lib/heading/clipboard/copyHeading";
import { cutHeading } from "@/components/Board/lib/heading/clipboard/cutHeading";
import type { HeadingAlign, HeadingData } from "@/components/Board/types/heading";

type Look = { fontSize: number; color: string; bold: boolean; align: HeadingAlign };

type Args = {
  heading: HeadingData;
  boardId: string;
  selected: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
  onCreated: (heading: HeadingData) => void;
  onLock: (id: string, locked: boolean) => void;
  onFront: () => void;
  onBack: () => void;
  onStyle: (id: string, look: Look) => void;
};

function typing(event: KeyboardEvent) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export function useHeadingMenu({
  heading,
  boardId,
  selected,
  onSelect,
  onDelete,
  onCreated,
  onLock,
  onFront,
  onBack,
  onStyle,
}: Args) {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    if (!selected) return;
    function onKey(event: KeyboardEvent) {
      if (typing(event)) return;
      const key = event.key.toLowerCase();
      const command = event.ctrlKey || event.metaKey;
      if (command && key === "c") {
        event.preventDefault();
        copyHeading(heading);
      } else if (command && key === "x") {
        event.preventDefault();
        cutHeading(heading, boardId, onDelete);
      } else if (command && key === "d") {
        event.preventDefault();
        void duplicateHeading(heading, boardId, onCreated);
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [boardId, heading, onCreated, onDelete, selected]);

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
      items={headingMenuEntries({
        locked: Boolean(heading.locked),
        cut: () => cutHeading(heading, boardId, onDelete),
        copy: () => copyHeading(heading),
        duplicate: () => void duplicateHeading(heading, boardId, onCreated),
        trash: () => trashHeading(heading.id, boardId, onDelete),
        lock: () => lockHeading(heading.id, !heading.locked, boardId, onLock),
        front: onFront,
        back: onBack,
        edit: () => setEdit(true),
      })}
    />
  ) : null;

  const editor = edit ? (
    <HeadingEditModal heading={heading} boardId={boardId} onStyle={onStyle} onClose={() => setEdit(false)} />
  ) : null;

  return { onContextMenu, menu, editor };
}
