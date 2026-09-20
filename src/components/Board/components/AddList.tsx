"use client";

import { useState, useTransition } from "react";
import { createList } from "@/app/actions";
import { Button, IconButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { IconClose } from "@/components/ui/Icons";

type Props = {
  boardId: string;
  onClose: () => void;
};

export function AddList({ boardId, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    startTransition(async () => {
      await createList(boardId, trimmed);
      setTitle("");
      onClose();
    });
  }

  return (
    <form
      onSubmit={submit}
      className="
        absolute left-6 top-6 z-10 w-[296px]
        rounded-panel border border-slate-200/70 bg-white p-3
        shadow-lg shadow-slate-900/[0.06] ring-1 ring-black/[0.02]
      "
    >
      <Input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        placeholder="List name, e.g. In review"
        className="mb-2"
      />
      <div className="flex items-center gap-2">
        <Button type="submit" variant="primary" size="sm" loading={isPending}>
          Add list
        </Button>
        <IconButton label="Cancel" onClick={onClose}>
          <IconClose size={18} />
        </IconButton>
      </div>
    </form>
  );
}