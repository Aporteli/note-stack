"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { FormEvent } from "react";
import {
  createFlashCard,
  deleteFlashCard,
  getRandomFlashCard,
  updateFlashCard,
} from "@/app/flash-cards/actions";
import {
  CARD_HEIGHT,
  CARD_HEIGHT_KEY,
  CARD_WIDTH,
  CARD_WIDTH_KEY,
  LAYOUT_KEY,
  TEXT_SIZE_KEY,
  clampSize,
  isTextSize,
  orderedCards,
  shuffleIds,
  type Draft,
  type DrawMode,
  type FlashCardData,
  type Layout,
  type TextSize,
} from "@/components/flash/lib/deck";

type Args = {
  topicId: string;
  cards: FlashCardData[];
};

export function useFlashDeck({ topicId, cards }: Args) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<FlashCardData | null>(null);
  const [isPending, startTransition] = useTransition();
  const [order, setOrder] = useState<string[] | null>(null);
  const [shuffleEpoch, setShuffleEpoch] = useState(0);
  const [textSize, setTextSize] = useState<TextSize>("md");
  const [cardWidth, setCardWidth] = useState(CARD_WIDTH.initial);
  const [cardHeight, setCardHeight] = useState(CARD_HEIGHT.initial);
  const [query, setQuery] = useState("");
  const [layout, setLayout] = useState<Layout>("grid");
  const [drawMode, setDrawMode] = useState<DrawMode>("repeat");
  const [randomCard, setRandomCard] = useState<FlashCardData | null>(null);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [uniqueDone, setUniqueDone] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(TEXT_SIZE_KEY);
    if (isTextSize(saved)) setTextSize(saved);
    const savedLayout = localStorage.getItem(LAYOUT_KEY);
    if (savedLayout === "grid" || savedLayout === "random") {
      setLayout(savedLayout);
    }
    const width = clampSize(
      localStorage.getItem(CARD_WIDTH_KEY),
      CARD_WIDTH.min,
      CARD_WIDTH.max,
    );
    const height = clampSize(
      localStorage.getItem(CARD_HEIGHT_KEY),
      CARD_HEIGHT.min,
      CARD_HEIGHT.max,
    );
    if (width) setCardWidth(width);
    if (height) setCardHeight(height);
  }, []);

  function chooseTextSize(next: TextSize) {
    setTextSize(next);
    localStorage.setItem(TEXT_SIZE_KEY, next);
  }

  function chooseCardWidth(next: number) {
    setCardWidth(next);
    localStorage.setItem(CARD_WIDTH_KEY, String(next));
  }

  function chooseCardHeight(next: number) {
    setCardHeight(next);
    localStorage.setItem(CARD_HEIGHT_KEY, String(next));
  }

  function chooseLayout(next: Layout) {
    setLayout(next);
    localStorage.setItem(LAYOUT_KEY, next);
  }

  function chooseDrawMode(next: DrawMode) {
    setDrawMode(next);
    setUniqueDone(false);
    if (next === "once") {
      setSeenIds(randomCard ? [randomCard.id] : []);
    } else {
      setSeenIds([]);
    }
  }

  function drawRandomCard() {
    startTransition(async () => {
      const exclude = drawMode === "once" ? seenIds : randomCard ? [randomCard.id] : [];
      const next = await getRandomFlashCard(topicId, exclude, drawMode === "repeat");
      if (!next) {
        if (drawMode === "once") {
          setRandomCard(null);
          setUniqueDone(true);
        }
        return;
      }
      setUniqueDone(false);
      setRandomCard(next);
      if (drawMode === "once") {
        setSeenIds((ids) => (ids.includes(next.id) ? ids : [...ids, next.id]));
      }
    });
  }

  useEffect(() => {
    if (layout !== "random") return;
    if (cards.length === 0) {
      setRandomCard(null);
      setUniqueDone(false);
      setSeenIds([]);
      return;
    }
    if (uniqueDone) return;
    const shown = randomCard;
    const fresh = shown ? cards.find((card) => card.id === shown.id) : undefined;
    if (fresh && shown) {
      if (fresh.front !== shown.front || fresh.back !== shown.back) {
        setRandomCard(fresh);
      }
      return;
    }
    drawRandomCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- draw when entering random view or the shown card is gone
  }, [layout, cards]);

  const deck = useMemo(() => orderedCards(cards, order), [cards, order]);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return deck;
    return deck.filter((card) => card.front.toLowerCase().includes(needle));
  }, [deck, query]);

  function openCreate() {
    setFront("");
    setBack("");
    setError("");
    setDraft({ mode: "create" });
  }

  function openEdit(card: FlashCardData) {
    setFront(card.front);
    setBack(card.back);
    setError("");
    setDraft({ mode: "edit", id: card.id });
  }

  function closeDraft() {
    if (isPending) return;
    setDraft(null);
    setError("");
  }

  function saveDraft(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;

    startTransition(async () => {
      const result =
        draft.mode === "create"
          ? await createFlashCard(topicId, front, back)
          : await updateFlashCard(draft.id, front, back);

      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDraft(null);
      setFront("");
      setBack("");
      setError("");
    });
  }

  function shuffleDeck() {
    const matching = new Set(visible.map((card) => card.id));
    const queue = shuffleIds([...matching]);
    setOrder(deck.map((card) => (matching.has(card.id) ? queue.shift()! : card.id)));
    setShuffleEpoch((epoch) => epoch + 1);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    startTransition(async () => {
      await deleteFlashCard(id);
      setPendingDelete(null);
    });
  }

  return {
    cards,
    draft,
    front,
    setFront,
    back,
    setBack,
    error,
    pendingDelete,
    setPendingDelete,
    isPending,
    shuffleEpoch,
    textSize,
    cardWidth,
    cardHeight,
    query,
    setQuery,
    layout,
    drawMode,
    randomCard,
    uniqueDone,
    visible,
    chooseTextSize,
    chooseCardWidth,
    chooseCardHeight,
    chooseLayout,
    chooseDrawMode,
    drawRandomCard,
    openCreate,
    openEdit,
    closeDraft,
    saveDraft,
    shuffleDeck,
    confirmDelete,
  };
}
