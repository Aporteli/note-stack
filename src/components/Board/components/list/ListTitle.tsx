"use client";

import { useEffect, useRef, useState } from "react";
import { renameList } from "@/app/actions";
import { stopDrag } from "@/components/Board/components/list/stopDrag";

type Props = {
  listId: string;
  boardId: string;
  title: string;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  onRename?: (id: string, title: string) => void;
};

export function ListTitle({
  listId,
  boardId,
  title,
  editing,
  onEditingChange,
  onRename,
}: Props) {
  const [name, setName] = useState(title);
  const skipCommit = useRef(false);

  useEffect(() => {
    if (editing) setName(title);
  }, [editing, title]);

  function commit() {
    if (skipCommit.current) {
      skipCommit.current = false;
      return;
    }
    const next = name.trim();
    onEditingChange(false);
    if (!next || next === title) return;
    onRename?.(listId, next);
    void renameList(listId, next, boardId);
  }

  function cancel() {
    skipCommit.current = true;
    setName(title);
    onEditingChange(false);
  }

  if (!editing) {
    return <h3 className="text-body font-semibold text-slate-900">{title}</h3>;
  }

  return (
    <input
      autoFocus
      value={name}
      aria-label="List name"
      onChange={(event) => setName(event.target.value)}
      onPointerDown={stopDrag}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
        if (event.key === "Escape") {
          event.preventDefault();
          cancel();
        }
      }}
      className="min-w-0 flex-1 bg-transparent text-body font-semibold text-slate-900 outline-none"
    />
  );
}
