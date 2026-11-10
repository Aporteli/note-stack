import type { ReactNode } from "react";

export function ToolbarRow({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-3 overflow-x-auto px-3 py-1.5">{children}</div>;
}
