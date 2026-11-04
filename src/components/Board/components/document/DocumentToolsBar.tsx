import type { ReactNode } from "react";
import { IconPencil } from "@/components/ui/Icons";
import type { Tab } from "@/components/Board/lib/sketch";
import { ChevronIcon } from "@/components/Board/components/document/ToolIcons";

type Props = {
  tab: Tab;
  toolsOpen: boolean;
  toolbar: ReactNode;
  onToggle: () => void;
};

export function DocumentToolsBar({ tab, toolsOpen, toolbar, onToggle }: Props) {
  return (
    <div className="shrink-0 border-b border-slate-100 bg-white px-3 py-2">
      <div className="flex flex-col items-center gap-1.5">
        <button
          type="button"
          aria-expanded={toolsOpen}
          aria-label={toolsOpen ? "Hide drawing tools" : "Show drawing tools"}
          onClick={onToggle}
          className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
        >
          <IconPencil size={14} />
          Tools
          <ChevronIcon up={toolsOpen} />
        </button>
        {toolsOpen ? toolbar : null}
      </div>
      {toolsOpen ? (
        <p className="mt-1.5 text-center text-[11px] text-slate-400">
          {tab === "write"
            ? "Draw on the text with the pen, line, or shapes. Choose Type to edit. Hold Shift to snap."
            : "Hold Shift to snap a line, or to draw a square or circle."}
        </p>
      ) : null}
    </div>
  );
}
