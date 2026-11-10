import { trashItems } from "@/app/actions";
import { writeListClip } from "@/components/Board/lib/list/clipboard/ListClip";
import type { ListData } from "@/components/Board/types/board";

export function cutList(list: ListData, boardId: string, remove: (id: string) => void) {
  writeListClip({
    cut: true,
    title: list.title,
    w: list.w,
    h: list.h,
    cards: list.cards.map((card) => ({ title: card.title, image: card.image ?? null })),
  });
  remove(list.id);
  void trashItems([{ type: "list", id: list.id }], boardId);
}
