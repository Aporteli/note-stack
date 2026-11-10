"use client";

import { useEffect, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { ContextMenu } from "@/components/Board/components/ContextMenu";
import { downloadDrawing } from "@/components/Board/components/draw/menu/downloadDrawing";
import { drawMenuEntries } from "@/components/Board/components/draw/menu/drawMenuEntries";
import { duplicateDrawing } from "@/components/Board/components/draw/menu/duplicateDrawing";
import { lockDrawing } from "@/components/Board/components/draw/menu/lockDrawing";
import { trashDrawing } from "@/components/Board/components/draw/menu/trashDrawing";
import { copyDrawing } from "@/components/Board/lib/draw/clipboard/copyDrawing";
import { cutDrawing } from "@/components/Board/lib/draw/clipboard/cutDrawing";
import type { DrawingData } from "@/components/Board/types/board";

type Args = {
  drawing: DrawingData;
  boardId: string;
  selected: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
  onCreated: (drawing: DrawingData) => void;
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

export function useDrawingMenu({
  drawing,
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
        copyDrawing(drawing);
      } else if (command && key === "x") {
        event.preventDefault();
        cutDrawing(drawing, boardId, onDelete);
      } else if (command && key === "d") {
        event.preventDefault();
        void duplicateDrawing(drawing, boardId, onCreated);
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [boardId, drawing, onCreated, onDelete, selected]);

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
      items={drawMenuEntries({
        locked: Boolean(drawing.locked),
        cut: () => cutDrawing(drawing, boardId, onDelete),
        copy: () => copyDrawing(drawing),
        duplicate: () => void duplicateDrawing(drawing, boardId, onCreated),
        trash: () => trashDrawing(drawing.id, boardId, onDelete),
        download: () => downloadDrawing(drawing),
        lock: () => lockDrawing(drawing.id, !drawing.locked, boardId, onLock),
        front: onFront,
        back: onBack,
      })}
    />
  ) : null;

  return { onContextMenu, menu };
}
