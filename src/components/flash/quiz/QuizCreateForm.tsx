import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

export function QuizCreateForm({
  title,
  error,
  pending,
  onTitle,
  onSubmit,
}: {
  title: string;
  error: string;
  pending: boolean;
  onTitle: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="flex w-full flex-wrap gap-2 sm:w-auto">
      <Button type="submit" variant="primary" loading={pending} className="h-10 w-[130px]">
        Create quiz
      </Button>
      <Input
        value={title}
        onChange={(event) => onTitle(event.target.value)}
        placeholder="Name a new quiz"
        aria-label="New quiz name"
        invalid={Boolean(error)}
        className="h-10 sm:w-64"
      />
      {error ? <p className="basis-full text-meta text-danger">{error}</p> : null}
    </form>
  );
}
