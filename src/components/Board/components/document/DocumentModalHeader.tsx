import type { ReactNode } from "react";
import { IconButton } from "@/components/ui/Button";
import { IconClose, IconDescription, IconPencil } from "@/components/ui/Icons";
import type { Tab } from "@/components/Board/lib/sketch";

type Props = {
  title: string;
  tab: Tab;
  onTitle: (value: string) => void;
  onWrite: () => void;
  onSketch: () => void;
  onClose: () => void;
};

export function DocumentModalHeader({
  title,
  tab,
  onTitle,
  onWrite,
  onSketch,
  onClose,
}: Props) {
  return (
    <header className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-1">
      <IconDescription size={18} className="shrink-0 text-slate-500" />
      <input
        value={title}
        onChange={(event) => onTitle(event.target.value)}
        placeholder="Untitled"
        className="min-w-0 flex-1 rounded-md border-0 bg-transparent px-1 text-lg font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
      />

     

      
    </header>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
        active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}
