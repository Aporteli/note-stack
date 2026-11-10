"use client";

import { useEffect, useRef } from "react";
import { HeadingEditor } from "@/components/Board/components/heading/HeadingEditor";
import { HeadingResizeHandle } from "@/components/Board/components/heading/HeadingResizeHandle";
import { useHeadingMenu } from "@/components/Board/components/heading/menu/useHeadingMenu";
import { bandZ } from "@/components/Board/components/itemMenu/bandZ";
import { useHeadingResize } from "@/components/Board/hooks/useHeadingResize";
import type { HeadingAlign, HeadingData } from "@/components/Board/types/heading";

type Look = { fontSize: number; color: string; bold: boolean; align: HeadingAlign };

type Props = {
  boardId: string;
  heading: HeadingData;
  selected: boolean;
  dragOffset: { dx: number; dy: number } | null;
  onText: (id: string, text: string) => void;
  onResize: (id: string, w: number, h: number) => void;
  onStartDrag: (id: string, clientX: number, clientY: number, shift: boolean) => void;
  onDelete: (id: string) => void;
  onCreated: (heading: HeadingData) => void;
  onLock: (id: string, locked: boolean) => void;
  onFront: () => void;
  onBack: () => void;
  onSelect: () => void;
  onStyle: (id: string, look: Look) => void;
};

export function HeadingCard({
  boardId,
  heading,
  selected,
  dragOffset,
  onText,
  onResize,
  onStartDrag,
  onDelete,
  onCreated,
  onLock,
  onFront,
  onBack,
  onSelect,
  onStyle,
}: Props) {
  const editorRef = useRef<HTMLInputElement>(null);
  const dragging = dragOffset !== null;
  const dx = dragOffset ? Math.max(-heading.x, dragOffset.dx) : 0;
  const dy = dragOffset ? Math.max(-heading.y, dragOffset.dy) : 0;
  const startResize = useHeadingResize({
    boardId,
    headingId: heading.id,
    width: heading.w,
    height: heading.h,
    onResize,
  });
  const menu = useHeadingMenu({
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
  });

  useEffect(() => {
    if (dragging) editorRef.current?.blur();
  }, [dragging]);

  return (
    <div
      data-item-type="heading"
      data-item-id={heading.id}
      onContextMenu={menu.onContextMenu}
      onPointerDown={(event) => {
        event.stopPropagation();
        if (event.button !== 0 || heading.locked || event.shiftKey) return;
        onStartDrag(heading.id, event.clientX, event.clientY, event.shiftKey);
      }}
      onDoubleClick={() => editorRef.current?.focus()}
      className={`absolute flex items-center bg-transparent px-4 ${
        heading.locked ? "cursor-default" : ""
      } ${selected ? "border-2 border-slate-900" : "border border-slate-700"}`}
      style={{
        left: heading.x,
        top: heading.y,
        width: heading.w,
        height: heading.h,
        zIndex: bandZ(24, 42, 78, heading.z, selected, dragging),
        touchAction: "none",
        cursor: heading.locked ? "default" : dragging ? "grabbing" : "grab",
        ...(dragging
          ? { transform: `translate3d(${dx}px, ${dy}px, 0)`, willChange: "transform" }
          : null),
      }}
    >
      <HeadingEditor
        boardId={boardId}
        headingId={heading.id}
        text={heading.text}
        fresh={heading.fresh}
        fontSize={heading.fontSize}
        color={heading.color}
        bold={heading.bold}
        align={heading.align}
        editorRef={editorRef}
        onText={(text) => onText(heading.id, text)}
      />
      {heading.locked ? null : <HeadingResizeHandle onResizeStart={startResize} />}
      {menu.menu}
      {menu.editor}
    </div>
  );
}
