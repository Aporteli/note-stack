"use client";

import { useDraggable } from "@dnd-kit/core";
import { LinkIcon } from "@/components/Board/components/link/LinkIcon";
import { NEW_LINK_DRAG_ID } from "@/components/Board/types/link";

export function LinkButton() {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: NEW_LINK_DRAG_ID,
    data: { type: "new-link" },
  });

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      type="button"
      aria-label="New link — drag onto the board"
      title="Drag onto the board to create a link"
      className="
        inline-flex h-9 items-center gap-1.5
        bg-white px-3 text-sm font-medium text-slate-700
        shadow-sm ring-1 ring-slate-200
        transition-all duration-150
        hover:bg-slate-50 hover:shadow
        active:scale-[0.98]
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-slate-900/30 focus-visible:ring-offset-2
      "
      style={{ touchAction: "none", opacity: isDragging ? 0.4 : undefined }}
    >
      <LinkIcon />
      <span>Link</span>
    </button>
  );
}
