"use client";

import { useRef, useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { createPictureCard } from "@/app/actions";
import { AddCardButton, AddCardForm } from "@/components/Board/components/list/AddCardForm";
import { ListCards } from "@/components/Board/components/list/ListCards";
import { ListHeader } from "@/components/Board/components/list/ListHeader";
import { listStackZ } from "@/components/Board/components/list/menu/listStackZ";
import { useListMenu } from "@/components/Board/components/list/menu/useListMenu";
import { ListResizeHandle } from "@/components/Board/components/list/ListResizeHandle";
import { useListResize } from "@/components/Board/hooks/useListResize";
import { imageDataUrl, pastedImageFiles } from "@/components/Board/lib/list/pastedImage";
import { LIST_H, LIST_W } from "@/components/Board/lib/list/size";

type ListProps = {
  list: {
    id: string;
    title: string;
    x: number;
    y: number;
    w?: number;
    h?: number;
    z?: number;
    locked?: boolean;
    cards: { id: string; title: string; image?: string | null }[];
  };
  boardId: string;
  index?: number;
  onOpenCard?: (id: string) => void;
  onResize?: (id: string, w: number, h: number) => void;
  onRename?: (id: string, title: string) => void;
  onDelete?: (id: string) => void;
  onPicture?: (listId: string, card: { id: string; title: string; image?: string | null }) => void;
  onCreated?: (list: {
    id: string;
    title: string;
    x: number;
    y: number;
    w: number;
    h: number;
    z?: number;
    locked?: boolean;
    cards: { id: string; title: string; image?: string | null }[];
  }) => void;
  onLock?: (id: string, locked: boolean) => void;
  onFront?: () => void;
  onBack?: () => void;
  onSelect?: () => void;
  /** True when this list is in the board's selection. */
  selected?: boolean;
};

export function List({
  list,
  boardId,
  onOpenCard,
  onResize,
  onRename,
  onDelete,
  onPicture,
  onCreated,
  onLock,
  onFront,
  onBack,
  onSelect,
  selected = false,
}: ListProps) {
  const [adding, setAdding] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [resizing, setResizing] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);
  const width = list.w || LIST_W;
  const height = list.h || LIST_H;
  const { startResize, resizingRef } = useListResize({
    boardId,
    listId: list.id,
    width,
    height,
    nodeRef: rootRef,
    onResize,
    onResizing: setResizing,
  });

  const {
    setNodeRef: setDragRef,
    listeners,
    transform,
    isDragging,
  } = useDraggable({
    id: list.id,
    data: { type: "list", x: list.x, y: list.y },
    disabled: resizing || Boolean(list.locked) || list.id.startsWith("temp-"),
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: list.id });

  const setRefs = (node: HTMLElement | null) => {
    rootRef.current = node;
    setDragRef(node);
    setDropRef(node);
  };

  const { onPointerDown: startDrag, ...restListeners } = (listeners ?? {}) as {
    onPointerDown?: (event: React.PointerEvent) => void;
  };

  const style: React.CSSProperties = {
    position: "absolute",
    left: list.x,
    top: list.y,
    width,
    height,
    zIndex: isDragging ? 100000 : listStackZ(list.z, selected),
    opacity: isDragging ? 0.9 : 1,
    transform: isDragging
      ? `translate3d(${transform?.x ?? 0}px, ${transform?.y ?? 0}px, 0)`
      : undefined,
  };

  async function pastePicture(event: React.ClipboardEvent) {
    const files = pastedImageFiles(event.clipboardData);
    if (files.length === 0) return;
    event.preventDefault();
    for (const file of files) {
      const image = await imageDataUrl(file);
      if (!image) continue;
      const card = await createPictureCard(list.id, image, boardId);
      if (card) onPicture?.(list.id, card);
    }
  }

  const menu = useListMenu({
    list: {
      id: list.id,
      title: list.title,
      x: list.x,
      y: list.y,
      w: width,
      h: height,
      z: list.z,
      locked: list.locked,
      cards: list.cards,
    },
    boardId,
    selected,
    onRename: () => setRenaming(true),
    onSelect: () => onSelect?.(),
    onDelete: (id) => onDelete?.(id),
    onPicture: (listId, card) => onPicture?.(listId, card),
    onCreated: (created) => onCreated?.(created),
    onLock: (id, locked) => onLock?.(id, locked),
    onFront: () => onFront?.(),
    onBack: () => onBack?.(),
  });

  return (
    <section
      ref={setRefs}
      style={style}
      onPaste={pastePicture}
      onContextMenu={menu.onContextMenu}
      {...restListeners}
      onPointerDown={(event) => {
        const target = event.target;
        if (
          resizingRef.current ||
          (target instanceof Element && target.closest("[data-list-resize]"))
        ) {
          event.stopPropagation();
          return;
        }
        startDrag?.(event);
      }}
      tabIndex={-1}
      onPointerDownCapture={(event) => {
        const target = event.target;
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
        event.currentTarget.focus({ preventScroll: true });
      }}
      aria-label={list.title}
      data-item-type="list"
      data-item-id={list.id}
      className={`
        flex min-h-0 shrink-0 outline-none
        ${list.locked ? "cursor-default" : "cursor-grab active:cursor-grabbing"}
        flex-col border-2 bg-white p-2.5 shadow-sm
        ${isDragging ? "shadow-lift-3" : ""}
        ${selected ? "border-black" : "border-slate-200"}
        data-[file-drop=true]:border-blue-500
      `}
    >
      <ListHeader
        listId={list.id}
        boardId={boardId}
        title={list.title}
        count={list.cards.length}
        renaming={renaming}
        onRenamingChange={setRenaming}
        onAddCard={() => setAdding(true)}
        onRename={onRename}
        onDelete={onDelete}
      />
      <ListCards
        cards={list.cards}
        adding={adding}
        isOver={isOver}
        onOpenCard={onOpenCard}
      />
      {adding ? (
        <AddCardForm listId={list.id} boardId={boardId} onClose={() => setAdding(false)} />
      ) : (
        <AddCardButton onClick={() => setAdding(true)} />
      )}
      <ListResizeHandle onResizeStart={startResize} />
      {menu.menu}
    </section>
  );
}
