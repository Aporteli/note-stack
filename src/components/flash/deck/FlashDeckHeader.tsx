import Link from "next/link";
import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/Button";
import { SearchField } from "@/components/ui/Field";
import { IconBack, IconPlus, IconShuffle, IconStack } from "@/components/ui/Icons";
import { CardSizeControl } from "@/components/flash/deck/CardSizeControl";
import { DrawModeToggle, LayoutToggle } from "@/components/flash/deck/DeckToggles";
import { TextSizePicker } from "@/components/flash/deck/TextSizePicker";
import { deckStatus, type DrawMode, type Layout, type TextSize } from "@/components/flash/lib/deck";

type Props = {
  topicName: string;
  cardCount: number;
  visibleCount: number;
  layout: Layout;
  drawMode: DrawMode;
  query: string;
  textSize: TextSize;
  cardWidth: number;
  cardHeight: number;
  canShuffle: boolean;
  canDraw: boolean;
  drawing: boolean;
  uniqueDone: boolean;
  onLayout: (next: Layout) => void;
  onDrawMode: (next: DrawMode) => void;
  onQuery: (event: ChangeEvent<HTMLInputElement>) => void;
  onWidth: (next: number) => void;
  onHeight: (next: number) => void;
  onTextSize: (next: TextSize) => void;
  onShuffle: () => void;
  onDraw: () => void;
  onCreate: () => void;
};

export function FlashDeckHeader({
  topicName,
  cardCount,
  visibleCount,
  layout,
  drawMode,
  query,
  textSize,
  cardWidth,
  cardHeight,
  canShuffle,
  canDraw,
  drawing,
  uniqueDone,
  onLayout,
  onDrawMode,
  onQuery,
  onWidth,
  onHeight,
  onTextSize,
  onShuffle,
  onDraw,
  onCreate,
}: Props) {
  return (
    <div className="flex shrink-0 flex-col gap-3 border-b border-line px-3 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <Link
          href="/flash-cards"
          className="mb-1 inline-flex items-center gap-1 text-meta font-medium text-ink-soft hover:text-ink"
        >
          <IconBack size={14} />
          All topics
        </Link>
        <h1 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          {topicName}
        </h1>
        <p className="truncate text-sm text-ink-soft">
          {deckStatus(cardCount, layout, query, visibleCount)}
        </p>
      </div>
      <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:justify-end">
        <LayoutToggle layout={layout} onChange={onLayout} />
        {layout === "random" ? (
          <DrawModeToggle drawMode={drawMode} onChange={onDrawMode} />
        ) : null}
        {layout === "grid" ? (
          <SearchField
            value={query}
            onChange={onQuery}
            placeholder="Search cards"
            aria-label="Search cards"
            className="w-full sm:w-52"
          />
        ) : null}
        <CardSizeControl
          width={cardWidth}
          height={cardHeight}
          onWidth={onWidth}
          onHeight={onHeight}
        />
        <div className="flex flex-wrap items-center gap-2">
          <TextSizePicker textSize={textSize} onChange={onTextSize} />
          {layout === "grid" ? (
            <Button type="button" variant="secondary" onClick={onShuffle} disabled={!canShuffle}>
              <IconShuffle size={18} />
              Shuffle
            </Button>
          ) : layout === "random" ? (
            <Button
              type="button"
              variant="secondary"
              onClick={onDraw}
              disabled={!canDraw || drawing || uniqueDone}
            >
              <IconStack size={18} />
              New random card
            </Button>
          ) : null}
          <Button type="button" variant="primary" onClick={onCreate}>
            <IconPlus size={18} />
            New card
          </Button>
        </div>
      </div>
    </div>
  );
}
