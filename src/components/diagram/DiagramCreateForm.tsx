import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

type Props = {
  name: string;
  error: string;
  pending: boolean;
  onName: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
};

export function DiagramCreateForm({ name, error, pending, onName, onSubmit }: Props) {
  return (
    <form onSubmit={onSubmit} className="flex w-full mb-6 flex-wrap gap-2 sm:w-auto">
      <Button type="submit" variant="primary" loading={pending} className="h-10 w-[150px]">
        New diagram
      </Button>
      <Input
        value={name}
        onChange={(event) => onName(event.target.value)}
        placeholder="Name a diagram"
        aria-label="New diagram name"
        invalid={Boolean(error)}
        className="h-10 sm:w-64"
      />
      {error ? <p className="basis-full text-meta text-danger">{error}</p> : null}
    </form>
  );
}
