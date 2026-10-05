"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  createFlashCard,
  deleteFlashCard,
  updateFlashCard,
} from "@/app/flash-cards/actions";
import { ConfirmDialog } from "@/components/Board/components/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Feedback";
import { Field, SearchField, Textarea } from "@/components/ui/Field";
import {
  IconBack,
  IconCard,
  IconForward,
  IconGrid,
  IconPencil,
  IconPlus,
  IconShuffle,
  IconTrash,
} from "@/components/ui/Icons";
import { Modal } from "@/components/ui/Overlay";

export type FlashCardData = {
  id: string;
  front: string;
  back: string;
};

const TEXT_SIZES = [
  { id: "sm", label: "Small text" },
  { id: "md", label: "Medium text" },
  { id: "lg", label: "Large text" },
  { id: "xl", label: "Extra large text" },
] as const;

type TextSize = (typeof TEXT_SIZES)[number]["id"];

const TEXT_SIZE_KEY = "flash-text-size";
const CARD_WIDTH_KEY = "flash-card-width";
const CARD_HEIGHT_KEY = "flash-card-height";
const LAYOUT_KEY = "flash-layout";
const CARD_WIDTH = { min: 160, max: 640, initial: 320 };
const CARD_HEIGHT = { min: 140, max: 520, initial: 260 };

type LayoutMode = "grid" | "focus";

function isLayoutMode(value: string | null): value is LayoutMode {
  return value === "grid" || value === "focus";
}

function isTextSize(value: string | null): value is TextSize {
  return TEXT_SIZES.some((size) => size.id === value);
}

const STRIPES = [
  "var(--color-orchid)",
  "var(--color-lagoon)",
  "var(--color-coral)",
  "var(--color-mint)",
  "var(--color-plum)",
];

type Draft =
  | { mode: "create" }
  | { mode: "edit"; id: string };

function clampSize(value: string | null, min: number, max: number) {
  const next = Number(value);
  if (!Number.isFinite(next)) return null;
  return Math.min(max, Math.max(min, Math.round(next)));
}

function orderedCards(cards: FlashCardData[], order: string[] | null) {
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

function shuffleIds(ids: string[]) {
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

function CardSizeControl({
  width,
  height,
  onWidth,
  onHeight,
}: {
  width: number;
  height: number;
  onWidth: (next: number) => void;
  onHeight: (next: number) => void;
}) {
  return (
    <div
      className="flex w-full min-w-0 flex-col gap-2 rounded-lg border border-line bg-paper px-3 py-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3 sm:py-1.5"
      role="group"
      aria-label="Card size"
    >
      <SizeSlider
        label="Width"
        value={width}
        min={CARD_WIDTH.min}
        max={CARD_WIDTH.max}
        onChange={onWidth}
      />
      <SizeSlider
        label="Height"
        value={height}
        min={CARD_HEIGHT.min}
        max={CARD_HEIGHT.max}
        onChange={onHeight}
      />
    </div>
  );
}

function SizeSlider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <label className="flex min-w-0 flex-1 items-center gap-2 text-meta font-medium text-ink-soft">
      <span className="w-11 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={10}
        value={value}
        aria-valuetext={`${value} pixels`}
        aria-label={`Card ${label.toLowerCase()}`}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1 w-full min-w-0 flex-1 cursor-pointer accent-orchid sm:w-24"
      />
      <span className="w-8 tabular-nums text-ink">{value}</span>
    </label>
  );
}

export function FlashDeck({ cards }: { cards: FlashCardData[] }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<FlashCardData | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  const [order, setOrder] = useState<string[] | null>(null);
  const [shuffleEpoch, setShuffleEpoch] = useState(0);
  const [textSize, setTextSize] = useState<TextSize>("md");
  const [cardWidth, setCardWidth] = useState(CARD_WIDTH.initial);
  const [cardHeight, setCardHeight] = useState(CARD_HEIGHT.initial);
  const [layout, setLayout] = useState<LayoutMode>("grid");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- restore saved deck chrome after SSR */
    const saved = localStorage.getItem(TEXT_SIZE_KEY);
    if (isTextSize(saved)) setTextSize(saved);
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
    const savedLayout = localStorage.getItem(LAYOUT_KEY);
    if (isLayoutMode(savedLayout)) setLayout(savedLayout);
    /* eslint-enable react-hooks/set-state-in-effect */
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

  function chooseLayout(next: LayoutMode) {
    setLayout(next);
    localStorage.setItem(LAYOUT_KEY, next);
  }

  function toggleLayout() {
    chooseLayout(layout === "grid" ? "focus" : "grid");
  }

  const deck = useMemo(() => orderedCards(cards, order), [cards, order]);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return deck;
    return deck.filter(
      (card) =>
        card.front.toLowerCase().includes(needle),
    );
  }, [deck, query]);

  const activeIndex = useMemo(() => {
    if (visible.length === 0) return -1;
    const found = visible.findIndex((card) => card.id === activeId);
    return found === -1 ? 0 : found;
  }, [visible, activeId]);
  const activeCard = activeIndex >= 0 ? visible[activeIndex] : null;

  function goBy(offset: number) {
    if (visible.length < 2 || activeIndex < 0) return;
    const next =
      (activeIndex + offset + visible.length) % visible.length;
    setActiveId(visible[next].id);
  }

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

  function saveDraft(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;

    startTransition(async () => {
      const result =
        draft.mode === "create"
          ? await createFlashCard(front, back)
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
    setOrder(
      deck.map((card) => (matching.has(card.id) ? queue.shift()! : card.id)),
    );
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

  useEffect(() => {
    if (layout !== "focus") return;

    function onKey(event: KeyboardEvent) {
      if (draft !== null || pendingDelete !== null) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest("input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (visible.length < 2 || activeIndex < 0) return;
      event.preventDefault();
      const offset = event.key === "ArrowLeft" ? -1 : 1;
      const next = (activeIndex + offset + visible.length) % visible.length;
      setActiveId(visible[next].id);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [layout, draft, pendingDelete, visible, activeIndex]);

  return (
    <section
      className="flash-deck flex min-h-0 flex-1 flex-col"
      data-size={textSize}
      data-layout={layout}
    >
      <div className="flex shrink-0 flex-col gap-3 border-b border-line px-3 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            Flash cards
          </h1>
          <p className="truncate text-sm text-ink-soft">
            {cards.length === 0
              ? "Write both sides, then click a card to flip it."
              : query.trim()
                ? `${visible.length} of ${cards.length} ${cards.length === 1 ? "card" : "cards"}`
                : layout === "focus"
                  ? `${cards.length} ${cards.length === 1 ? "card" : "cards"} · one at a time`
                  : `${cards.length} ${cards.length === 1 ? "card" : "cards"} · click any card to flip it`}
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:justify-end">
          <SearchField
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search cards"
            aria-label="Search cards"
            className="w-full sm:w-52"
          />
          <CardSizeControl
            width={cardWidth}
            height={cardHeight}
            onWidth={chooseCardWidth}
            onHeight={chooseCardHeight}
          />
          <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex items-center rounded-lg border border-line bg-paper p-0.5"
            role="group"
            aria-label="Text size"
          >
            {TEXT_SIZES.map((size) => (
              <button
                key={size.id}
                type="button"
                aria-pressed={textSize === size.id}
                aria-label={size.label}
                title={size.label}
                onClick={() => chooseTextSize(size.id)}
                className={`grid h-8 w-8 place-items-center rounded-md font-display font-semibold leading-none text-ink-soft hover:text-ink ${
                  textSize === size.id ? "bg-surface text-ink" : ""
                }`}
                style={{
                  fontSize:
                    size.id === "sm"
                      ? "0.7rem"
                      : size.id === "md"
                        ? "0.85rem"
                        : size.id === "lg"
                          ? "1.05rem"
                          : "1.25rem",
                }}
              >
                A
              </button>
            ))}
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={toggleLayout}
            disabled={cards.length === 0}
            aria-pressed={layout === "focus"}
            title={
              layout === "grid"
                ? "Show one card at a time"
                : "Show all cards together"
            }
          >
            {layout === "grid" ? (
              <>
                <IconCard size={18} />
                One card
              </>
            ) : (
              <>
                <IconGrid size={18} />
                All cards
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={shuffleDeck}
            disabled={visible.length < 2}
          >
            <IconShuffle size={18} />
            Shuffle
          </Button>
          <Button type="button" variant="primary" onClick={openCreate}>
            <IconPlus size={18} />
            New card
          </Button>
          </div>
        </div>
      </div>

      <div className="flash-scroll min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
        {cards.length === 0 ? (
          <div className="grid min-h-full place-items-center">
            <div className="w-full max-w-lg">
              <EmptyState
                title="No flash cards yet"
                body="Create a card and write whatever you want on the front and the back. It shows the front until you click it."
                action={
                  <Button type="button" variant="primary" onClick={openCreate}>
                    <IconPlus size={18} />
                    New card
                  </Button>
                }
              />
            </div>
          </div>
        ) : visible.length === 0 ? (
          <div className="grid min-h-full place-items-center">
            <div className="w-full max-w-lg">
              <EmptyState
                title="No matching cards"
                body="Nothing on the front of a card includes that search."
              />
            </div>
          </div>
        ) : layout === "focus" && activeCard ? (
          <div className="flex min-h-full flex-col items-center justify-center gap-5 py-4">
            <div
              className="max-w-full"
              style={{
                width: cardWidth,
                height: cardHeight,
              }}
            >
              <FlipCard
                key={`${activeCard.id}-${shuffleEpoch}`}
                card={activeCard}
                stripe={STRIPES[activeIndex % STRIPES.length]}
                onEdit={() => openEdit(activeCard)}
                onDelete={() => setPendingDelete(activeCard)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => goBy(-1)}
                disabled={visible.length < 2}
                aria-label="Previous card"
              >
                <IconBack size={18} />
                Prev
              </Button>
              <p
                className="min-w-16 text-center text-sm tabular-nums text-ink-soft"
                aria-live="polite"
              >
                {activeIndex + 1} / {visible.length}
              </p>
              <Button
                type="button"
                variant="secondary"
                onClick={() => goBy(1)}
                disabled={visible.length < 2}
                aria-label="Next card"
              >
                Next
                <IconForward size={18} />
              </Button>
            </div>
          </div>
        ) : (
          <ul
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${cardWidth}px), min(100%, ${cardWidth}px)))`,
              gridAutoRows: `${cardHeight}px`,
            }}
          >
            {visible.map((card, index) => (
              <li key={`${card.id}-${shuffleEpoch}`} className="min-h-0">
                <FlipCard
                  card={card}
                  stripe={STRIPES[index % STRIPES.length]}
                  onEdit={() => openEdit(card)}
                  onDelete={() => setPendingDelete(card)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={draft !== null}
        onClose={closeDraft}
        title={draft?.mode === "edit" ? "Edit flash card" : "New flash card"}
        description="The front is what you see first. The back shows after you click the card."
        size="lg"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={closeDraft}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="flash-card-form"
              variant="primary"
              loading={isPending}
            >
              {draft?.mode === "edit" ? "Save card" : "Create card"}
            </Button>
          </>
        }
      >
        <form
          id="flash-card-form"
          onSubmit={saveDraft}
          className="grid gap-4 sm:grid-cols-2"
        >
          <Field label="Front">
            {({ id, describedBy }) => (
              <Textarea
                id={id}
                aria-describedby={describedBy}
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Write the front of this card"
                rows={8}
                className="flash-field min-h-32 sm:min-h-48"
                autoFocus
              />
            )}
          </Field>
          <Field label="Back">
            {({ id, describedBy }) => (
              <Textarea
                id={id}
                aria-describedby={describedBy}
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Write the back of this card"
                rows={8}
                className="flash-field min-h-32 sm:min-h-48"
              />
            )}
          </Field>
          {error && (
            <p className="text-meta text-danger sm:col-span-2">{error}</p>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this card?"
        body="The front and the back will both be removed."
        confirmLabel="Delete card"
        tone="danger"
        busy={isPending}
        onCancel={() => {
          if (!isPending) setPendingDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </section>
  );
}

function FlipCard({
  card,
  stripe,
  onEdit,
  onDelete,
}: {
  card: FlashCardData;
  stripe: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [showBack, setShowBack] = useState(false);
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");

  function flip() {
    if (phase !== "idle") return;
    setPhase("out");
  }

  function handleAnimationEnd(event: React.AnimationEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.animationName === "flash-out") {
      setShowBack((value) => !value);
      setPhase("in");
    } else if (event.animationName === "flash-in") {
      setPhase("idle");
    }
  }

  return (
    <div className="group relative h-full">
      <div
        role="button"
        tabIndex={0}
        aria-pressed={showBack}
        onClick={flip}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            flip();
          }
        }}
        className="flash-scene"
      >
        <div
          className={`flash-turn${phase === "out" ? " is-out" : ""}${
            phase === "in" ? " is-in" : ""
          }`}
          onAnimationEnd={handleAnimationEnd}
        >
          <div
            className={`flash-face ${
              showBack ? "flash-face-back" : "flash-face-front"
            }`}
          >
            <span className="flash-stripe" style={{ background: stripe }} />
            <span className="flash-kicker"></span>
            <span className="flash-copy">{showBack ? card.back : card.front}</span>
          </div>
        </div>
      </div>

      {phase === "idle" && !showBack && (
        <div className="flash-actions absolute right-2 top-3 z-10 flex gap-1 transition-opacity">
          <button
            type="button"
            aria-label="Edit card"
            onClick={onEdit}
            className="grid h-8 w-8 place-items-center rounded-lg bg-paper/95 text-ink-soft shadow-lift-1 ring-1 ring-line hover:text-ink"
          >
            <IconPencil size={15} />
          </button>
          <button
            type="button"
            aria-label="Delete card"
            onClick={onDelete}
            className="grid h-8 w-8 place-items-center rounded-lg bg-paper/95 text-ink-soft shadow-lift-1 ring-1 ring-line hover:text-danger"
          >
            <IconTrash size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
