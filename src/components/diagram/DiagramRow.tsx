import type { KeyboardEvent } from "react";
import Link from "next/link";
import { formatEdited } from "@/components/diagram/lib/formatEdited";
import type { DiagramSummary } from "@/components/diagram/types";
import { Button } from "@/components/ui/Button";
import { IconTrash } from "@/components/ui/Icons";

type Props = {
  diagram: DiagramSummary;
  editing: boolean;
  draft: string;
  onDraft: (value: string) => void;
  onBeginRename: () => void;
  onCommit: () => void;
  onCancel: () => void;
  onDelete: () => void;
};

export function DiagramRow({
  diagram,
  editing,
  draft,
  onDraft,
  onBeginRename,
  onCommit,
  onCancel,
  onDelete,
}: Props) {
  return (
    <li className="ns-card flex items-center justify-between gap-3 p-4">
      {editing ? (
        <input
          value={draft}
          autoFocus
          onChange={(event) => onDraft(event.target.value)}
          onBlur={onCommit}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") onCancel();
          }}
          className="ns-field min-w-0 flex-1"
          aria-label="Diagram name"
        />
      ) : (
        <Link href={`/diagrams/${diagram.id}`} className="min-w-0 flex-1">
          <span className="block truncate font-display text-lead font-semibold text-ink">{diagram.title}</span>
          <span className="mt-1 block text-meta text-ink-faint">Edited {formatEdited(diagram.updatedAt)}</span>
        </Link>
      )}
      <Button type="button" variant="ghost" size="sm" onClick={onBeginRename}>
        Rename
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onDelete} aria-label={`Delete ${diagram.title}`}>
        <IconTrash size={15} />
      </Button>
    </li>
  );
}
