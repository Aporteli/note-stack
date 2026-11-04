"use client";

import { ConfirmDialog } from "@/components/Board/components/ConfirmDialog";
import { FlashCardModal } from "@/components/flash/deck/FlashCardModal";
import { FlashDeckBoard } from "@/components/flash/deck/FlashDeckBoard";
import { FlashDeckHeader } from "@/components/flash/deck/FlashDeckHeader";
import { useFlashDeck } from "@/components/flash/hooks/useFlashDeck";
import type { FlashCardData } from "@/components/flash/lib/deck";

export type { FlashCardData };

export function FlashDeck({
  topicId,
  topicName,
  cards,
}: {
  topicId: string;
  topicName: string;
  cards: FlashCardData[];
}) {
  const deck = useFlashDeck({ topicId, cards });

  return (
    <section className="flash-deck flex min-h-0 flex-1 flex-col" data-size={deck.textSize}>
      <FlashDeckHeader
        topicName={topicName}
        cardCount={cards.length}
        visibleCount={deck.visible.length}
        layout={deck.layout}
        drawMode={deck.drawMode}
        query={deck.query}
        textSize={deck.textSize}
        cardWidth={deck.cardWidth}
        cardHeight={deck.cardHeight}
        canShuffle={deck.visible.length >= 2}
        canDraw={cards.length > 0}
        drawing={deck.isPending}
        uniqueDone={deck.uniqueDone}
        onLayout={deck.chooseLayout}
        onDrawMode={deck.chooseDrawMode}
        onQuery={(event) => deck.setQuery(event.target.value)}
        onWidth={deck.chooseCardWidth}
        onHeight={deck.chooseCardHeight}
        onTextSize={deck.chooseTextSize}
        onShuffle={deck.shuffleDeck}
        onDraw={() => deck.drawRandomCard()}
        onCreate={deck.openCreate}
      />

      <FlashDeckBoard
        cards={cards}
        visible={deck.visible}
        layout={deck.layout}
        uniqueDone={deck.uniqueDone}
        randomCard={deck.randomCard}
        cardWidth={deck.cardWidth}
        cardHeight={deck.cardHeight}
        shuffleEpoch={deck.shuffleEpoch}
        onCreate={deck.openCreate}
        onEdit={deck.openEdit}
        onDelete={deck.setPendingDelete}
      />

      <FlashCardModal
        draft={deck.draft}
        front={deck.front}
        back={deck.back}
        error={deck.error}
        pending={deck.isPending}
        onFront={deck.setFront}
        onBack={deck.setBack}
        onClose={deck.closeDraft}
        onSubmit={deck.saveDraft}
      />

      <ConfirmDialog
        open={deck.pendingDelete !== null}
        title="Delete this card?"
        body="The front and the back will both be removed."
        confirmLabel="Delete card"
        tone="danger"
        busy={deck.isPending}
        onCancel={() => {
          if (!deck.isPending) deck.setPendingDelete(null);
        }}
        onConfirm={deck.confirmDelete}
      />
    </section>
  );
}
