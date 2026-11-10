"use client";

import { useEffect, useState } from "react";
import { isTempId } from "@/components/Board/lib/items";
import { withoutPending } from "@/components/Board/lib/keepRemoved";
import type { ListData } from "@/components/Board/types/board";

function mergeCards(local: ListData["cards"], incoming: ListData["cards"]) {
  const byId = new Map(local.map((card) => [card.id, card]));
  const incomingIds = new Set(incoming.map((card) => card.id));
  const saved = incoming.map((card) => {
    const existing = byId.get(card.id);
    if (!existing?.image || card.image) return card;
    return { ...card, image: existing.image };
  });
  const pending = local.filter((card) => !incomingIds.has(card.id));
  return withoutPending([...saved, ...pending]);
}

function mergeLists(local: ListData[], incoming: ListData[]): ListData[] {
  const byId = new Map(local.map((list) => [list.id, list]));
  const incomingIds = new Set(incoming.map((list) => list.id));
  const saved = incoming.map((list) => {
    const existing = byId.get(list.id);
    if (!existing) return list;
    return {
      ...list,
      title: existing.title,
      x: existing.x,
      y: existing.y,
      w: existing.w,
      h: existing.h,
      z: existing.z ?? list.z,
      locked: existing.locked ?? list.locked,
      cards: mergeCards(existing.cards, list.cards),
    };
  });
  const pending = local.filter((list) => isTempId(list.id) && !incomingIds.has(list.id));
  return [...saved, ...pending];
}

export function useLists(initial: ListData[]) {
  const [lists, setLists] = useState<ListData[]>(initial);

  // A move refreshes the board from the server. Keep the size and position
  // already on screen so that refresh cannot snap a resized list back.
  useEffect(() => {
    setLists((current) => mergeLists(current, initial));
  }, [initial]);

  return [lists, setLists] as const;
}