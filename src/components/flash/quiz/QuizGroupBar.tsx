import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { IconPlus } from "@/components/ui/Icons";

type Crumb = { id: string | null; name: string };

export function QuizBreadcrumbs({
  crumbs,
  folderId,
  onOpen,
}: {
  crumbs: Crumb[];
  folderId: string | null;
  onOpen: (id: string | null) => void;
}) {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm" aria-label="Quiz groups">
      {crumbs.map((crumb, index) => (
        <span key={crumb.id ?? "root"} className="inline-flex items-center gap-1">
          {index > 0 ? <span className="text-ink-faint">/</span> : null}
          <button
            type="button"
            onClick={() => onOpen(crumb.id)}
            className={
              crumb.id === folderId ? "font-semibold text-ink" : "text-ink-soft hover:text-ink"
            }
          >
            {crumb.name}
          </button>
        </span>
      ))}
    </nav>
  );
}

export function QuizGroupForm({
  folderId,
  name,
  error,
  pending,
  onName,
  onSubmit,
}: {
  folderId: string | null;
  name: string;
  error: string;
  pending: boolean;
  onName: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <div className="min-w-0 flex-1">
        <Input
          value={name}
          onChange={(event) => onName(event.target.value)}
          placeholder={folderId ? "Name a subgroup" : "Name a group, for example Programming"}
          aria-label="New group name"
          invalid={Boolean(error)}
        />
        {error ? <p className="mt-1.5 text-meta text-danger">{error}</p> : null}
      </div>
      <Button type="submit" variant="secondary" loading={pending}>
        {!pending && <IconPlus size={18} />}
        {folderId ? "Add subgroup" : "Add group"}
      </Button>
    </form>
  );
}
