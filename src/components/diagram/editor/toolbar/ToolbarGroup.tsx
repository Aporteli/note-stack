import type { ReactNode } from "react";

export function ToolbarGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="flex shrink-0 items-center gap-1.5" aria-label={label}>
      <span className="text-meta font-semibold uppercase tracking-wide text-ink-faint">{label}</span>
      <div className="flex items-center gap-0.5 rounded-md border border-line p-0.5">{children}</div>
    </section>
  );
}
