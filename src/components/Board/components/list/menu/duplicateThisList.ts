import { placeListCopy } from "@/app/lists/placeListCopy";
import type { ListData } from "@/components/Board/types/board";

export async function duplicateThisList(
  list: ListData,
  boardId: string,
  onCreated: (list: ListData) => void,
) {
  const created = await placeListCopy(boardId, {
    title: list.title,
    x: list.x + 28,
    y: list.y + 28,
    w: list.w,
    h: list.h,
    cards: list.cards,
  });
  if (created) onCreated(created);
}
