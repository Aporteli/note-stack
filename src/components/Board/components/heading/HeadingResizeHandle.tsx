import type { PointerEvent as ReactPointerEvent } from "react";

type Props = {
  onResizeStart: (event: ReactPointerEvent) => void;
};

export function HeadingResizeHandle({ onResizeStart }: Props) {
  return (
    <span
      aria-label="Resize heading"
      role="button"
      onPointerDown={onResizeStart}
      onClick={(event) => event.stopPropagation()}
      className="absolute bottom-0 right-0 z-10 h-4 w-4 cursor-nwse-resize"
    >
      <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" className="absolute bottom-1 right-1">
        <path d="M11 1 L11 11 L1 11" fill="none" stroke="#64748b" strokeWidth="1.4" />
      </svg>
    </span>
  );
}
