"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card } from "@/components/Card";

type CardData = { id: string; title: string; image?: string | null };

type Props = {
  cards: CardData[];
  adding: boolean;
  isOver: boolean;
  onOpenCard?: (id: string) => void;
};

export function ListCards({ cards, adding, isOver, onOpenCard }: Props) {
  return (
    <div
      className={`
        ns-scroll min-h-0 flex-1 overflow-y-auto rounded-card px-0.5
        transition-colors ${isOver ? "bg-slate-50" : ""}
      `}
    >
      <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
        {cards.map((card) => (
          <Card key={card.id} card={card} onOpen={onOpenCard} />
        ))}
      </SortableContext>

      {cards.length === 0 && !adding && (
        <p className="grid h-16 place-items-center border border-dashed border-slate-200 text-sm text-slate-400">
          Drop a card here
        </p>
      )}
    </div>
  );
}
