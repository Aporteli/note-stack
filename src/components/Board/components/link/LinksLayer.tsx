import { LinkCard } from "@/components/Board/components/link/LinkCard";
import type { LinkData, LinkPreview } from "@/components/Board/types/link";

type Drag = { dx: number; dy: number; ids: ReadonlySet<string> };

type Props = {
  boardId: string;
  links: LinkData[];
  selectedItemKeys: Set<string>;
  linkDrag: Drag | null;
  onStartDrag: (id: string, clientX: number, clientY: number, shift: boolean) => void;
  onPreview: (id: string, preview: LinkPreview) => void;
};

export function LinksLayer({
  boardId,
  links,
  selectedItemKeys,
  linkDrag,
  onStartDrag,
  onPreview,
}: Props) {
  return links.map((link) => (
    <LinkCard
      key={link.key}
      boardId={boardId}
      link={link}
      selected={selectedItemKeys.has(`link:${link.id}`)}
      dragOffset={linkDrag?.ids.has(link.id) ? { dx: linkDrag.dx, dy: linkDrag.dy } : null}
      onStartDrag={onStartDrag}
      onPreview={onPreview}
    />
  ));
}
