import type { DraftLink } from "@/components/diagram/gesture";
import { sidePoint } from "@/components/diagram/lib/sidePoint";
import type { DiagramShape } from "@/components/diagram/types";

export function DraftConnector({ draft, shapes }: { draft: DraftLink; shapes: DiagramShape[] }) {
  const from = shapes.find((shape) => shape.id === draft.fromId);
  if (!from) return null;
  const start = sidePoint(from, draft.fromSide);
  return (
    <line
      x1={start.x}
      y1={start.y}
      x2={draft.x}
      y2={draft.y}
      stroke="var(--color-ink-soft)"
      strokeWidth={1.75}
      markerEnd="url(#diagram-arrow)"
      pointerEvents="none"
    />
  );
}
