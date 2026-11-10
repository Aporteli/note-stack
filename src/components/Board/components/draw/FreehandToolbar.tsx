import type { ReactNode } from "react";
import { Button, IconButton } from "@/components/ui/Button";
import { IconCheck, IconClose, IconPencil, IconTrash } from "@/components/ui/Icons";
import {
  FREEHAND_COLORS,
  FREEHAND_WIDTHS,
  type FreehandTool,
} from "@/components/Board/lib/freehand";

type Props = {
  tool: FreehandTool;
  color: string;
  thickness: number;
  onTool: (tool: FreehandTool) => void;
  onColor: (value: string) => void;
  onThickness: (width: number) => void;
  onClear: () => void;
  onDiscard: () => void;
  onSave: () => void;
  pinned?: boolean;
};

export function FreehandToolbar({
  tool,
  color,
  thickness,
  onTool,
  onColor,
  onThickness,
  onClear,
  onDiscard,
  onSave,
  pinned = false,
}: Props) {
  return (
    <div
      className={
        pinned
          ? "flex shrink-0 justify-center border-t border-slate-200 bg-white px-4 py-3"
          : "pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex justify-center px-4"
      }
    >
      <div
        className={
          pinned
            ? "flex flex-wrap items-center gap-3"
            : "pointer-events-auto flex flex-wrap items-center gap-3 border border-slate-200 bg-white/95 px-3 py-2 shadow-2xl shadow-slate-900/10 backdrop-blur-md"
        }
      >
        <div className="flex items-center gap-1">
          <ToolButton active={tool === "pencil"} label="Pencil" onClick={() => onTool("pencil")}>
            <IconPencil size={18} />
          </ToolButton>
          <ToolButton active={tool === "eraser"} label="Eraser" onClick={() => onTool("eraser")}>
            <EraserIcon />
          </ToolButton>
        </div>

        <Divider />

        <div className="flex items-center gap-1.5">
          {FREEHAND_COLORS.map((swatch) => (
            <button
              key={swatch.value}
              type="button"
              aria-label={swatch.name}
              title={swatch.name}
              onClick={() => onColor(swatch.value)}
              className={`h-6 w-6 rounded-full ring-2 transition-transform ${
                color === swatch.value && tool === "pencil"
                  ? "ring-slate-900 scale-110"
                  : "ring-transparent hover:scale-105"
              }`}
              style={{ background: swatch.value }}
            />
          ))}
        </div>

        <Divider />

        <div className="flex items-center gap-1.5">
          {FREEHAND_WIDTHS.map((width) => (
            <button
              key={width}
              type="button"
              aria-label={`Width ${width}`}
              onClick={() => onThickness(width)}
              className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
                thickness === width
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span
                className="rounded-full bg-current"
                style={{ width: width + 2, height: width + 2 }}
              />
            </button>
          ))}
        </div>

        <Divider />

        <IconButton
          label="Clear drawing"
          onClick={onClear}
          className="text-slate-600 hover:bg-slate-100"
        >
          <IconTrash size={18} />
        </IconButton>

        <Divider />

        <Button variant="ghost" onClick={onDiscard}>
          <IconClose size={16} />
          Discard
        </Button>
        <Button variant="primary" onClick={onSave}>
          <IconCheck size={16} />
          Save drawing
        </Button>
      </div>
    </div>
  );
}

function ToolButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid h-9 w-9 place-items-center rounded-lg transition-colors ${
        active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="h-6 w-px bg-slate-200" />;
}

function EraserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.5 4.5l3 3-7 7H5.5l-1-1v-3l8-6z" />
      <path d="M8.5 8.5l3 3" />
    </svg>
  );
}
