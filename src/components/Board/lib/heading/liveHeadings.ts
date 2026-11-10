import type { HeadingData } from "@/components/Board/types/heading";

type Drag = { dx: number; dy: number; ids: ReadonlySet<string> };

export function liveHeadings(headings: HeadingData[], drag: Drag | null): HeadingData[] {
  if (!drag) return headings;
  return headings.map((heading) =>
    drag.ids.has(heading.id)
      ? {
          ...heading,
          x: Math.max(0, heading.x + drag.dx),
          y: Math.max(0, heading.y + drag.dy),
        }
      : heading,
  );
}
