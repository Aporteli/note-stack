export type FlashCardData = {
  id: string;
  front: string;
  back: string;
};

export const TEXT_SIZES = [
  { id: "sm", label: "Small text" },
  { id: "md", label: "Medium text" },
  { id: "lg", label: "Large text" },
  { id: "xl", label: "Extra large text" },
] as const;

export type TextSize = (typeof TEXT_SIZES)[number]["id"];
export type Layout = "grid" | "random";
export type DrawMode = "repeat" | "once";
export type Draft = { mode: "create" } | { mode: "edit"; id: string };

export const TEXT_SIZE_KEY = "flash-text-size";
export const LAYOUT_KEY = "flash-layout";
export const CARD_WIDTH_KEY = "flash-card-width";
export const CARD_HEIGHT_KEY = "flash-card-height";
export const CARD_WIDTH = { min: 160, max: 640, initial: 320 };
export const CARD_HEIGHT = { min: 140, max: 520, initial: 260 };

export const STRIPES = [
  "var(--color-orchid)",
  "var(--color-lagoon)",
  "var(--color-coral)",
  "var(--color-mint)",
  "var(--color-plum)",
];

export function isTextSize(value: string | null): value is TextSize {
  return TEXT_SIZES.some((size) => size.id === value);
}

export function clampSize(value: string | null, min: number, max: number) {
  const next = Number(value);
  if (!Number.isFinite(next)) return null;
  return Math.min(max, Math.max(min, Math.round(next)));
}

export function orderedCards(cards: FlashCardData[], order: string[] | null) {
  if (!order) return cards;
  const byId = new Map(cards.map((card) => [card.id, card]));
  const seen = new Set(order);
  const kept = order.flatMap((id) => {
    const card = byId.get(id);
    return card ? [card] : [];
  });
  const added = cards.filter((card) => !seen.has(card.id));
  return [...kept, ...added];
}

export function shuffleIds(ids: string[]) {
  if (ids.length < 2) return ids;
  const next = [...ids];
  for (let attempt = 0; attempt < 6; attempt++) {
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const swap = next[i];
      next[i] = next[j];
      next[j] = swap;
    }
    if (next.some((id, index) => id !== ids[index])) return [...next];
  }
  return next;
}

export function deckStatus(
  cardCount: number,
  layout: Layout,
  query: string,
  visibleCount: number,
) {
  if (cardCount === 0) {
    return "Write both sides, then click a card to flip it.";
  }
  if (layout === "random") {
    return "One card at a time · draw a new one from the database";
  }
  if (query.trim()) {
    return `${visibleCount} of ${cardCount} ${cardCount === 1 ? "card" : "cards"}`;
  }
  return `${cardCount} ${cardCount === 1 ? "card" : "cards"} · click any card to flip it`;
}

export function textSizeFont(id: TextSize) {
  if (id === "sm") return "0.7rem";
  if (id === "md") return "0.85rem";
  if (id === "lg") return "1.05rem";
  return "1.25rem";
}
