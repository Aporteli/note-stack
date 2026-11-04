import type { ReactNode } from "react";
import { IconPencil, IconTrash } from "@/components/ui/Icons";
import { COLORS, WIDTHS, type Tool } from "@/components/Board/lib/sketch";
import {
  EllipseIcon,
  EraserIcon,
  LineIcon,
  RectIcon,
  TypeIcon,
  UndoIcon,
} from "@/components/Board/components/document/ToolIcons";

type Props = {
  tool: Tool;
  showType: boolean;
  color: string;
  thickness: number;
  canUndo: boolean;
  canClear: boolean;
  drawing: boolean;
  onTool: (tool: Tool) => void;
  onColor: (value: string) => void;
  onThickness: (width: number) => void;
  onUndo: () => void;
  onClear: () => void;
};

export function DrawToolbar({
  tool,
  showType,
  color,
  thickness,
  canUndo,
  canClear,
  drawing,
  onTool,
  onColor,
  onThickness,
  onUndo,
  onClear,
}: Props) {
  return (
    <div className="mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-1.5">
      {showType ? (
        <ToolToggle
          active={tool === "type"}
          label="Type"
          hint="Edit the text"
          onClick={() => onTool("type")}
        >
          <TypeIcon />
        </ToolToggle>
      ) : null}
      <ToolToggle
        active={tool === "pen"}
        label="Pen"
        hint="Freehand pen"
        onClick={() => onTool("pen")}
      >
        <IconPencil size={16} />
      </ToolToggle>
      <ToolToggle
        active={tool === "line"}
        label="Straight line"
        hint="Straight line. Hold Shift to lock horizontal or vertical."
        onClick={() => onTool("line")}
      >
        <LineIcon />
      </ToolToggle>
      <ToolToggle
        active={tool === "rect"}
        label="Rectangle"
        hint="Rectangle. Hold Shift for a square."
        onClick={() => onTool("rect")}
      >
        <RectIcon />
      </ToolToggle>
      <ToolToggle
        active={tool === "ellipse"}
        label="Ellipse"
        hint="Ellipse. Hold Shift for a circle."
        onClick={() => onTool("ellipse")}
      >
        <EllipseIcon />
      </ToolToggle>
      <ToolToggle
        active={tool === "eraser"}
        label="Eraser"
        hint="Erase a stroke"
        onClick={() => onTool("eraser")}
      >
        <EraserIcon />
      </ToolToggle>

      <span className="mx-0.5 h-5 w-px bg-slate-200" />

      {COLORS.map((swatch) => (
        <button
          key={swatch.value}
          type="button"
          aria-label={swatch.name}
          title={swatch.name}
          onClick={() => onColor(swatch.value)}
          className={`h-5 w-5 rounded-full ring-2 transition-transform ${
            color === swatch.value && drawing
              ? "scale-110 ring-slate-900"
              : "ring-transparent hover:scale-105"
          }`}
          style={{ background: swatch.value }}
        />
      ))}

      <span className="mx-0.5 h-5 w-px bg-slate-200" />

      {WIDTHS.map((width) => (
        <button
          key={width}
          type="button"
          aria-label={`Width ${width}`}
          title={`Width ${width}`}
          onClick={() => onThickness(width)}
          className={`grid h-7 w-7 place-items-center rounded-md transition-colors ${
            thickness === width
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span
            className="rounded-full bg-current"
            style={{ width: Math.min(width + 2, 14), height: Math.min(width + 2, 14) }}
          />
        </button>
      ))}

      <span className="mx-0.5 h-5 w-px bg-slate-200" />

      <ToolToggle
        active={false}
        label="Undo"
        hint="Undo (Ctrl+Z)"
        disabled={!canUndo}
        onClick={onUndo}
      >
        <UndoIcon />
      </ToolToggle>
      <button
        type="button"
        aria-label="Clear sketch"
        title="Clear sketch"
        onClick={onClear}
        disabled={!canClear}
        className="grid h-7 w-7 place-items-center rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-40"
      >
        <IconTrash size={16} />
      </button>
    </div>
  );
}

function ToolToggle({
  active,
  label,
  hint,
  onClick,
  disabled,
  children,
}: {
  active: boolean;
  label: string;
  hint?: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={hint ?? label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-7 w-7 place-items-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}
