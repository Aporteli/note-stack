"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteBoard } from "@/app/actions";
import { IconStack, IconTrash } from "./ui/Icons";

const SPINES = [
  "rgb(var(--orchid))",
  "rgb(var(--lagoon))",
  "rgb(var(--coral))",
  "rgb(var(--mint))",
  "rgb(var(--plum))",
];

/**
 * A board on the shelf: coloured spine on the left, title, and when it was
 * started. The spine hue is derived from the id, so it stays stable per board.
 */
export function BoardTile({
  board,
  index = 0,
}: {
  board: { id: string; title: string; createdAt: Date | string };
  index?: number;
}) {
  const spine = SPINES[index % SPINES.length];
  const [pending, startTransition] = useTransition();

  function remove() {
    if (!window.confirm(`Delete "${board.title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteBoard(board.id);
    });
  }

  return (
    <div
      className={`ns-card group relative flex min-h-[112px] flex-col justify-between overflow-hidden p-4 pl-5 ${
        pending ? "opacity-60" : ""
      }`}
    >
      <span
        className="absolute inset-y-0 left-0 w-1.5 transition-[width] duration-200 ease-ns group-hover:w-2.5"
        style={{ background: spine }}
        aria-hidden="true"
      />
      <Link href={`/board/${board.id}`} className="absolute inset-0 z-0">
        <span className="sr-only">{board.title}</span>
      </Link>
      <h2 className="pointer-events-none relative z-10 pr-8 font-display text-lead font-semibold text-ink">
        {board.title}
      </h2>
      <p className="pointer-events-none relative z-10 flex items-center gap-1.5 text-meta text-ink-faint">
        <IconStack size={15} />
        Started{" "}
        {new Date(board.createdAt).toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        aria-label={`Delete ${board.title}`}
        className="absolute top-2 right-2 z-10 rounded-md p-1.5 text-ink-faint hover:bg-coral/15 hover:text-coral disabled:opacity-40"
      >
        <IconTrash size={16} />
      </button>
    </div>
  );
}
