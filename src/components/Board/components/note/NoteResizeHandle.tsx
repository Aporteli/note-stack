import type { PointerEvent as ReactPointerEvent } from "react";

type Props = {
  onResizeStart: (event: ReactPointerEvent) => void;
};

export function NoteResizeHandle({ onResizeStart }: Props) {
  return (
    <span
      aria-label="Resize note"
      role="button"
      onPointerDown={onResizeStart}
      onClick={(event) => event.stopPropagation()}
      className="absolute bottom-0 right-0 z-10 h-7 w-7 cursor-nwse-resize"
    >
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" className="absolute bottom-0 right-0">
        <path d="M18 0 L18 18 L0 18 Z" fill="#f8fafc" />
        <path d="M18 0 L0 18" stroke="#94a3b8" strokeWidth="1" />
      </svg>
    </span>
  );
}
