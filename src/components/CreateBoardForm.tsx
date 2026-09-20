"use client";

import { useState, useTransition } from "react";
import { createBoard } from "@/app/actions";
import { Button } from "./ui/Button";
import { Input } from "./ui/Field";
import { IconPlus } from "./ui/Icons";

export default function CreateBoardForm() {
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    startTransition(async () => {
      await createBoard(trimmed);
      setTitle("");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-2 sm:w-auto">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Name a new board"
        aria-label="New board name"
        className="sm:w-64"
      />
      <Button type="submit" variant="primary" loading={isPending}>
        {!isPending && <IconPlus size={18} />}
        Create board
      </Button>
    </form>
  );
}
