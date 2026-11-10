"use client";

import { useRef } from "react";
import { LinkComposer } from "@/components/Board/components/link/LinkComposer";
import { LinkPreviewCard } from "@/components/Board/components/link/LinkPreviewCard";
import type { LinkData, LinkPreview } from "@/components/Board/types/link";

type Props = {
  boardId: string;
  link: LinkData;
  selected: boolean;
  dragOffset: { dx: number; dy: number } | null;
  onStartDrag: (id: string, clientX: number, clientY: number, shift: boolean) => void;
  onPreview: (id: string, preview: LinkPreview) => void;
};

export function LinkCard({ boardId, link, selected, dragOffset, onStartDrag, onPreview }: Props) {
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const dragging = dragOffset !== null;
  const dx = dragOffset ? Math.max(-link.x, dragOffset.dx) : 0;
  const dy = dragOffset ? Math.max(-link.y, dragOffset.dy) : 0;

  return (
    <div
      data-item-type="link"
      data-item-id={link.id}
      onPointerDown={(event) => {
        event.stopPropagation();
        const target = event.target;
        if (target instanceof Element && target.closest("input")) return;
        if (event.button !== 0) return;
        startRef.current = { x: event.clientX, y: event.clientY };
        onStartDrag(link.id, event.clientX, event.clientY, event.shiftKey);
      }}
      onClick={(event) => {
        if (!link.url) return;
        const start = startRef.current;
        const movedX = start ? event.clientX - start.x : 0;
        const movedY = start ? event.clientY - start.y : 0;
        if (Math.abs(movedX) + Math.abs(movedY) > 5) return;
        window.open(link.url, "_blank", "noopener,noreferrer");
      }}
      className={`absolute overflow-hidden border bg-white shadow-sm ${
        selected ? "border-black" : "border-slate-200"
      }`}
      style={{
        left: link.x,
        top: link.y,
        width: link.w,
        zIndex: dragging ? 74 : selected ? 48 : 36,
        cursor: dragging ? "grabbing" : "grab",
        touchAction: "none",
        ...(dragging
          ? { transform: `translate3d(${dx}px, ${dy}px, 0)`, willChange: "transform" }
          : null),
      }}
    >
      {link.url ? (
        <LinkPreviewCard link={link} />
      ) : (
        <LinkComposer
          linkId={link.id}
          boardId={boardId}
          fresh={link.fresh}
          onPreview={(preview) => onPreview(link.id, preview)}
        />
      )}
    </div>
  );
}
