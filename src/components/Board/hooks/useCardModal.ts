"use client";

import { useState } from "react";
import type { ListData } from "@/components/Board/types/board";

export function useCardModal(lists: ListData[]) {
  const [openCardId, setOpenCardId] = useState<string | null>(null);

  const allCards = lists.flatMap((list) => list.cards);
  const openCard = allCards.find((card) => card.id === openCardId);

  const openCardListTitle =
    lists.find((list) => list.cards.some((card) => card.id === openCardId))
      ?.title ?? "";

  return {
    openCardId,
    setOpenCardId,
    openCard,
    openCardListTitle,
  };
}