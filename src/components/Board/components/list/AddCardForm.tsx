"use client";

import { useState, useTransition } from "react";
import { createCard } from "@/app/actions";
import { stopDrag } from "@/components/Board/components/list/stopDrag";
import { Button, IconButton } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { IconClose, IconPlus } from "@/components/ui/Icons";

type Props = {
  listId: string;
  boardId: string;
  onClose: () => void;
};

export function AddCardForm({ listId, boardId, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    startTransition(async () => {
      await createCard(listId, trimmed, boardId);
      setTitle("");
      onClose();
    });
  }

  return (
    <form onSubmit={submit} className="mt-2" onPointerDown={stopDrag}>
      <Textarea
        autoFocus
        rows={2}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit(event);
          }
          if (event.key === "Escape") onClose();
        }}
        placeholder="What needs doing?"
        className="mb-2 !border-slate-200 !text-slate-900 placeholder:!text-slate-400 focus:!border-slate-400 focus:!shadow-none"
      />
      <div className="flex items-center gap-2">
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          loading={isPending}
          className="!border-slate-200 !bg-white !text-slate-700 hover:!bg-slate-50"
        >
          Add card
        </Button>
        <IconButton
          label="Cancel"
          className="!text-slate-600 hover:!bg-slate-100 hover:!text-slate-900"
          onClick={onClose}
        >
          <IconClose size={18} />
        </IconButton>
        <span className="ml-auto text-xs text-slate-400">Enter to add</span>
      </div>
    </form>
  );
}

export function AddCardButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      onPointerDown={stopDrag}
      className="mt-2 inline-flex h-9 w-full items-center gap-1.5 px-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
    >
      <IconPlus size={18} />
      Add card
    </button>
  );
}
