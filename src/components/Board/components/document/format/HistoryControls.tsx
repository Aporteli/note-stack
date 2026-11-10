"use client";

import { UndoIcon } from "@/components/Board/components/document/ToolIcons";
import { MarkButton } from "@/components/Board/components/document/format/controls";
import { ClearIcon } from "@/components/Board/components/document/format/icons";
import type { FormatRun } from "@/components/Board/components/document/format/marks";

export function HistoryControls({ run }: { run: FormatRun }) {
  return (
    <>
      <MarkButton label="Clear formatting" onClick={() => run(() => document.execCommand("removeFormat"))}>
        <ClearIcon />
      </MarkButton>
      <MarkButton label="Undo" title="Undo (Ctrl+Z)" onClick={() => run(() => document.execCommand("undo"))}>
        <UndoIcon />
      </MarkButton>
      <MarkButton label="Redo" title="Redo (Ctrl+Y)" onClick={() => run(() => document.execCommand("redo"))}>
        <span className="inline-grid scale-x-[-1]">
          <UndoIcon />
        </span>
      </MarkButton>
    </>
  );
}
