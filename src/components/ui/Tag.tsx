import type { ReactNode } from "react";
import { IconClock } from "./Icons";

/** The five palette hues, used as the label vocabulary across the product. */
export const TAG_TONES = {
  orchid: { bg: "rgb(var(--orchid) / 0.16)", dot: "rgb(var(--orchid))" },
  coral: { bg: "rgb(var(--coral) / 0.28)", dot: "rgb(var(--coral))" },
  lagoon: { bg: "rgb(var(--lagoon) / 0.26)", dot: "rgb(var(--lagoon))" },
  mint: { bg: "rgb(var(--mint) / 0.32)", dot: "rgb(var(--mint))" },
  plum: { bg: "rgb(var(--plum) / 0.16)", dot: "rgb(var(--plum))" },
} as const;

export type TagTone = keyof typeof TAG_TONES;

export function Tag({
  tone = "orchid",
  dot = true,
  children,
}: {
  tone?: TagTone;
  dot?: boolean;
  children: ReactNode;
}) {
  const t = TAG_TONES[tone];
  return (
    <span className="ns-chip" style={{ background: t.bg }}>
      {dot && (
        <span
          className="h-2 w-2 rounded-pill"
          style={{ background: t.dot }}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

/** A colour bar, for when a card shows labels without taking the text room. */
export function TagBar({ tones }: { tones: TagTone[] }) {
  return (
    <div className="flex gap-1">
      {tones.map((tone, i) => (
        <span
          key={`${tone}-${i}`}
          className="h-1.5 w-8 rounded-pill"
          style={{ background: TAG_TONES[tone].dot }}
        />
      ))}
    </div>
  );
}

const AVATAR_TONES = [
  "rgb(var(--orchid))",
  "rgb(var(--lagoon))",
  "rgb(var(--plum))",
  "rgb(var(--coral))",
  "rgb(var(--mint))",
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const tone =
    AVATAR_TONES[
      [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_TONES.length
    ];
  const light = tone.includes("--mint") || tone.includes("--coral");

  return (
    <span
      title={name}
      className="inline-grid shrink-0 place-items-center rounded-pill font-semibold ring-2 ring-paper"
      style={{
        background: tone,
        color: light ? "rgb(var(--plum-900))" : "rgb(var(--ink-invert))",
        width: size,
        height: size,
        fontSize: size * 0.4,
      }}
    >
      {initials(name)}
    </span>
  );
}


/** Due date reads as neutral, soon, or overdue — colour does not carry it alone. */
export function DueDate({ date }: { date: Date }) {
  const days = Math.ceil((date.getTime() - Date.now()) / 86_400_000);
  const state = days < 0 ? "overdue" : days <= 2 ? "soon" : ("later" as const);

  const styles = {
    overdue: "bg-[rgb(var(--danger)/0.12)] text-[rgb(var(--danger))]",
    soon: "bg-[rgb(var(--coral)/0.3)] text-plum-900",
    later: "bg-surface-sunk text-ink-soft",
  }[state];

  const text =
    state === "overdue"
      ? `${Math.abs(days)}d overdue`
      : days === 0
        ? "Due today"
        : `Due ${date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}`;

  return (
    <span className={`ns-chip ${styles}`}>
      <IconClock size={13} />
      {text}
    </span>
  );
}
