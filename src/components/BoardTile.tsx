import Link from "next/link";
import { IconStack } from "./ui/Icons";

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

  return (
    <Link
      href={`/board/${board.id}`}
      className="ns-card group relative flex min-h-[112px] flex-col justify-between overflow-hidden p-4 pl-5"
    >
      <span
        className="absolute inset-y-0 left-0 w-1.5 transition-[width] duration-200 ease-ns group-hover:w-2.5"
        style={{ background: spine }}
        aria-hidden="true"
      />
      <h2 className="font-display text-lead font-semibold text-ink">
        {board.title}
      </h2>
      <p className="flex items-center gap-1.5 text-meta text-ink-faint">
        <IconStack size={15} />
        Started{" "}
        {new Date(board.createdAt).toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>
    </Link>
  );
}
