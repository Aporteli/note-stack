import type { ReactNode } from "react";
import { IconAlert, IconCheck, IconClose } from "./Icons";

/* ------------------------------- Skeletons ------------------------------- */

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`ns-skeleton ${className}`} aria-hidden="true" />;
}

/** Matches the real card's box, so nothing jumps when data lands. */
export function CardSkeleton() {
  return (
    <div className="ns-card space-y-2 p-3">
      <Skeleton className="h-1.5 w-8 rounded-pill" />
      <Skeleton className="h-3.5 w-4/5" />
      <Skeleton className="h-3.5 w-2/5" />
    </div>
  );
}

export function ListSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="ns-folder shrink-0 p-3 pt-4">
      <Skeleton className="mb-3 h-4 w-28" />
      <div className="space-y-2">
        {Array.from({ length: cards }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ Empty states ----------------------------- */

/**
 * An empty screen is an invitation to act: say what goes here, then offer the
 * one action that fills it.
 */
export function EmptyState({
  art,
  title,
  body,
  action,
  onCanvas = false,
}: {
  art?: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
  onCanvas?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-panel px-6 py-12 text-center ${
        onCanvas
          ? "border border-dashed border-white/25 text-ink-invert"
          : "border border-dashed border-line-strong text-ink"
      }`}
    >
      {art ?? <StackArt muted={onCanvas} />}
      <h3 className="font-display text-lead">{title}</h3>
      <p
        className={`max-w-[46ch] text-body ${
          onCanvas ? "text-ink-invert/75" : "text-ink-soft"
        }`}
      >
        {body}
      </p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

/** Three cards settling into a stack — the product's own mark, reused. */
export function StackArt({ muted = false }: { muted?: boolean }) {
  const stroke = muted ? "rgb(255 255 255 / 0.5)" : "rgb(var(--line-strong))";
  return (
    <svg
      width="72"
      height="56"
      viewBox="0 0 72 56"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="14"
        y="4"
        width="44"
        height="14"
        rx="4"
        fill="rgb(var(--mint) / 0.45)"
        stroke={stroke}
      />
      <rect
        x="9"
        y="20"
        width="54"
        height="14"
        rx="4"
        fill="rgb(var(--lagoon) / 0.4)"
        stroke={stroke}
      />
      <rect
        x="4"
        y="36"
        width="64"
        height="15"
        rx="4"
        fill="rgb(var(--coral) / 0.4)"
        stroke={stroke}
      />
    </svg>
  );
}

/* --------------------------------- Toast --------------------------------- */

/**
 * Confirmations keep the verb of the action that caused them:
 * "Move card" → "Card moved".
 */
export function Toast({
  tone = "success",
  message,
  onDismiss,
}: {
  tone?: "success" | "error";
  message: string;
  onDismiss?: () => void;
}) {
  const ok = tone === "success";
  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-panel bg-plum-900 py-2.5 pl-3 pr-2 text-body text-ink-invert shadow-lift-3"
    >
      <span
        className="grid h-6 w-6 shrink-0 place-items-center rounded-pill"
        style={{
          background: ok ? "rgb(var(--mint))" : "rgb(var(--danger))",
          color: ok ? "rgb(var(--plum-900))" : "rgb(var(--ink-invert))",
        }}
      >
        {ok ? <IconCheck size={14} /> : <IconAlert size={14} />}
      </span>
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="ns-iconbtn h-7 w-7 text-ink-invert/70 hover:bg-white/15 hover:text-ink-invert"
        >
          <IconClose size={16} />
        </button>
      )}
    </div>
  );
}

/** Stacks toasts bottom-left, out of the way of the board's right edge. */
export function ToastViewport({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2 [&>*]:pointer-events-auto">
      {children}
    </div>
  );
}

/* --------------------------------- Banner -------------------------------- */

/** Errors explain what happened and what to do — never just "Oops". */
export function Banner({
  tone = "error",
  children,
}: {
  tone?: "error" | "info";
  children: ReactNode;
}) {
  const error = tone === "error";
  return (
    <div
      role={error ? "alert" : undefined}
      className="flex items-start gap-2.5 rounded-panel px-3.5 py-3 text-body"
      style={{
        background: error
          ? "rgb(var(--danger) / 0.08)"
          : "rgb(var(--lagoon) / 0.16)",
        color: error ? "rgb(var(--danger))" : "rgb(var(--plum-900))",
      }}
    >
      <IconAlert size={18} className="mt-px shrink-0" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
