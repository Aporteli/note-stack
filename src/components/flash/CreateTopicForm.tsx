"use client";

import { useState, useTransition } from "react";
import { createFlashTopic } from "@/app/flash-cards/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { IconPlus } from "@/components/ui/Icons";

export function CreateTopicForm() {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const result = await createFlashTopic(trimmed);
      if (result.ok) setName("");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-2 sm:w-auto">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name a new topic"
        aria-label="New topic name"
        className="sm:w-64"
      />
      <Button type="submit" variant="primary" loading={isPending}>
        {!isPending && <IconPlus size={18} />}
        Create topic
      </Button>
    </form>
  );
}
