import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Feedback";
import { IconPlus } from "@/components/ui/Icons";
import { FlipCard } from "@/components/flash/deck/FlipCard";
import { STRIPES, type FlashCardData, type Layout } from "@/components/flash/lib/deck";

type Props = {
  cards: FlashCardData[];
  visible: FlashCardData[];
  layout: Layout;
  uniqueDone: boolean;
  randomCard: FlashCardData | null;
  cardWidth: number;
  cardHeight: number;
  shuffleEpoch: number;
  onCreate: () => void;
  onEdit: (card: FlashCardData) => void;
  onDelete: (card: FlashCardData) => void;
};

export function FlashDeckBoard({
  cards,
  visible,
  layout,
  uniqueDone,
  randomCard,
  cardWidth,
  cardHeight,
  shuffleEpoch,
  onCreate,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="flash-scroll min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
      {cards.length === 0 ? (
        <div className="grid min-h-full place-items-center">
          <div className="w-full max-w-lg">
            <EmptyState
              title="No flash cards yet"
              body="Create a card and write whatever you want on the front and the back. It shows the front until you click it."
              action={
                <Button type="button" variant="primary" onClick={onCreate}>
                  <IconPlus size={18} />
                  New card
                </Button>
              }
            />
          </div>
        </div>
      ) : layout === "random" ? (
        <RandomCard
          uniqueDone={uniqueDone}
          randomCard={randomCard}
          cardWidth={cardWidth}
          cardHeight={cardHeight}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : visible.length === 0 ? (
        <div className="grid min-h-full place-items-center">
          <div className="w-full max-w-lg">
            <EmptyState
              title="No matching cards"
              body="Nothing on the front of a card includes that search."
            />
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
                onEdit={() => onEdit(card)}
                onDelete={() => onDelete(card)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RandomCard({
  uniqueDone,
  randomCard,
  cardWidth,
  cardHeight,
  onEdit,
  onDelete,
}: {
  uniqueDone: boolean;
  randomCard: FlashCardData | null;
  cardWidth: number;
  cardHeight: number;
  onEdit: (card: FlashCardData) => void;
  onDelete: (card: FlashCardData) => void;
}) {
  return (
    <div className="grid min-h-full place-items-center p-4">
      {uniqueDone ? (
        <div className="w-full max-w-lg">
          <EmptyState
            title="No more cards"
            body="Every card has been shown once. Refresh the page to start a new random round."
          />
        </div>
      ) : randomCard ? (
        <div className="w-full" style={{ maxWidth: cardWidth, height: cardHeight }}>
          <FlipCard
            key={randomCard.id}
            card={randomCard}
            stripe={STRIPES[0]}
            onEdit={() => onEdit(randomCard)}
            onDelete={() => onDelete(randomCard)}
          />
        </div>
      ) : (
        <p className="text-sm text-ink-soft">Picking a card…</p>
      )}
    </div>
  );
}
