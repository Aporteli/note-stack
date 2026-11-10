import { HeadingCard } from "@/components/Board/components/heading/HeadingCard";
import type { HeadingAlign, HeadingData } from "@/components/Board/types/heading";

type Drag = { dx: number; dy: number; ids: ReadonlySet<string> };
type Look = { fontSize: number; color: string; bold: boolean; align: HeadingAlign };

type Props = {
  boardId: string;
  headings: HeadingData[];
  selectedItemKeys: Set<string>;
  headingDrag: Drag | null;
  onText: (id: string, text: string) => void;
  onResize: (id: string, w: number, h: number) => void;
  onStartDrag: (id: string, clientX: number, clientY: number, shift: boolean) => void;
  onDelete: (id: string) => void;
  onCreated: (heading: HeadingData) => void;
  onLock: (id: string, locked: boolean) => void;
  onFront: (id: string) => void;
  onBack: (id: string) => void;
  onSelect: (id: string) => void;
  onStyle: (id: string, look: Look) => void;
};

export function HeadingsLayer({
  boardId,
  headings,
  selectedItemKeys,
  headingDrag,
  onText,
  onResize,
  onStartDrag,
  onDelete,
  onCreated,
  onLock,
  onFront,
  onBack,
  onSelect,
  onStyle,
}: Props) {
  return headings.map((heading) => (
    <HeadingCard
      key={heading.key}
      boardId={boardId}
      heading={heading}
      selected={selectedItemKeys.has(`heading:${heading.id}`)}
      dragOffset={
        headingDrag?.ids.has(heading.id) ? { dx: headingDrag.dx, dy: headingDrag.dy } : null
      }
      onText={onText}
      onResize={onResize}
      onStartDrag={onStartDrag}
      onDelete={onDelete}
      onCreated={onCreated}
      onLock={onLock}
      onFront={() => onFront(heading.id)}
      onBack={() => onBack(heading.id)}
      onSelect={() => onSelect(heading.id)}
      onStyle={onStyle}
    />
  ));
}
