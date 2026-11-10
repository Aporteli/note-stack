"use client";

import { useState } from "react";
import Link from "next/link";
import { renameDiagram } from "@/app/diagrams/actions/renameDiagram";
import type { SaveStatus } from "@/components/diagram/editor/useDiagramSave";
import { IconBack } from "@/components/ui/Icons";

const STATUS: Record<SaveStatus, string> = {
  saved: "Saved",
  saving: "Saving",
  error: "Not saved",
};

type Props = {
  id: string;
  title: string;
  status: SaveStatus;
};

export function DiagramHeader({ id, title, status }: Props) {
  const [draft, setDraft] = useState(title);

  async function commit() {
    if (draft.trim() === title) return;
    const next = await renameDiagram(id, draft);
    if (next) setDraft(next);
    else setDraft(title);
  }

  return (
    <header className="flex items-center gap-2 border-b border-line px-3 py-2">
      <Link href="/diagrams" aria-label="All diagrams" className="ns-iconbtn">
        <IconBack size={18} />
      </Link>
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => void commit()}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        aria-label="Diagram name"
        className="ns-field h-9 min-w-0 flex-1 font-display text-lead font-semibold sm:max-w-sm"
      />
      <span className="text-meta text-ink-faint">{STATUS[status]}</span>
    </header>
  );
}
