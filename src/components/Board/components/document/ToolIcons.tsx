import type { ReactNode } from "react";

export function ToolGlyph({ children }: { children: ReactNode }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function ChevronIcon({ up }: { up: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={up ? "M5 12.5L10 7.5l5 5" : "M5 7.5L10 12.5l5-5"} />
    </svg>
  );
}

export function TypeIcon() {
  return (
    <ToolGlyph>
      <path d="M5.5 5h9" />
      <path d="M10 5v10" />
      <path d="M8 15h4" />
    </ToolGlyph>
  );
}

export function LineIcon() {
  return (
    <ToolGlyph>
      <path d="M4.5 15.5L15.5 4.5" />
    </ToolGlyph>
  );
}

export function RectIcon() {
  return (
    <ToolGlyph>
      <rect x="4.25" y="4.75" width="11.5" height="10.5" rx="1" />
    </ToolGlyph>
  );
}

export function EllipseIcon() {
  return (
    <ToolGlyph>
      <ellipse cx="10" cy="10" rx="6" ry="4.25" />
    </ToolGlyph>
  );
}

export function EraserIcon() {
  return (
    <ToolGlyph>
      <path d="M12.5 4.5l3 3-7 7H5.5l-1-1v-3l8-6z" />
      <path d="M8.5 8.5l3 3" />
    </ToolGlyph>
  );
}

export function UndoIcon() {
  return (
    <ToolGlyph>
      <path d="M7.5 7.5L4.5 10l3 2.5" />
      <path d="M5 10h6.25a3.75 3.75 0 1 1 0 7.5H9" />
    </ToolGlyph>
  );
}
