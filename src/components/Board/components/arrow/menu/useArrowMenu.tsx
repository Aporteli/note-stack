"use client";

import { useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { duplicateItems } from "@/app/actions";
import { ContextMenu } from "@/components/Board/components/ContextMenu";
import { trashArrow } from "@/components/Board/components/arrow/menu/trashArrow";

type Args = {
  id: string;
  boardId: string;
  onSelect: () => void;
  onDelete: (id: string) => void;
};

export function useArrowMenu({ id, boardId, onSelect, onDelete }: Args) {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);

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
      items={[
        {
          label: "Duplicate",
          shortcut: "Ctrl D",
          onClick: () => void duplicateItems([{ type: "arrow", id }], boardId),
        },
        {
          label: "Move to Trash",
          shortcut: "Backspace",
          danger: true,
          onClick: () => trashArrow(id, boardId, onDelete),
        },
      ]}
    />
  ) : null;

  return { onContextMenu, menu };
}
