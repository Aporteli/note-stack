import type { FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { IconPlus } from '@/components/ui/Icons';

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
  return <nav className="flex flex-wrap items-center gap-1 text-sm" aria-label="Quiz groups"></nav>;
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
    <form onSubmit={onSubmit} className="flex w-full flex-wrap gap-2 sm:w-auto">
      <Button type="submit" variant="primary" loading={pending} className="h-10 w-[130px]">
        {folderId ? "Add subgroup" : "Add group"}
      </Button>
      <Input
        value={name}
        onChange={(event) => onName(event.target.value)}
        placeholder={folderId ? "Name a subgroup" : "Name a group, for example Programming"}
        aria-label="New group name"
        invalid={Boolean(error)}
        className="h-10 sm:w-64"
      />
      {error ? <p className="basis-full text-meta text-danger">{error}</p> : null}
    </form>
  );
}
