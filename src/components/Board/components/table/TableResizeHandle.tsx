import type { PointerEvent as ReactPointerEvent } from "react";

type Props = {
  onResizeStart: (event: ReactPointerEvent) => void;
};

export function TableResizeHandle({ onResizeStart }: Props) {
  return (
    <span
      data-table-resize
      aria-label="Expand table"
      role="button"
      onPointerDown={onResizeStart}
      className="absolute bottom-0 right-0 z-10 h-4 w-4 cursor-nwse-resize"
    >
      <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" className="absolute bottom-0.5 right-0.5">
        <path d="M3 11 L11 3 M7 11 L11 7" fill="none" stroke="#334155" strokeWidth="1.2" />
      </svg>
    </span>
  );
}
