import type { ListData } from "@/components/Board/types/board";
import { writeListClip } from "@/components/Board/lib/list/clipboard/ListClip";

export function copyList(list: ListData) {
  writeListClip({
    cut: false,
    title: list.title,
    w: list.w,
    h: list.h,
    cards: list.cards.map((card) => ({ title: card.title, image: card.image ?? null })),
  });
}
