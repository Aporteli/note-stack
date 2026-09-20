"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DueDate, TagBar } from "./ui/Tag";
import type { TagTone } from "./ui/Tag";
import { IconDescription, IconGrip } from "./ui/Icons";

type CardProps = {
  card: {
    id: string;
    title: string;
    description?: string | null;
    dueDate?: Date | string | null;
    labels?: TagTone[];
    members?: string[];
  };
  onOpen?: (id: string) => void;
  selected?: boolean;
};

export function Card({ card, onOpen, selected = false }: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const due = card.dueDate ? new Date(card.dueDate) : null;
  const hasMeta = due || card.description || card.members?.length;

  const { onPointerDown: cardPointerDown, ...restListeners } =
    (listeners ?? {}) as Record<string, unknown> & {
      onPointerDown?: (e: React.PointerEvent) => void;
    };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...restListeners}
      onPointerDown={(e) => {
        e.stopPropagation();
        cardPointerDown?.(e);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onOpen?.(card.id);
      }}
      data-item-type="card"
      data-item-id={card.id}
      className={`ns-card group mb-2 cursor-grab p-3 active:cursor-grabbing ${
        selected ? "ring-2 ring-blue-500" : ""
      }`}
    >
      {card.labels && card.labels.length > 0 && (
        <div className="mb-2">
          <TagBar tones={card.labels} />
        </div>
      )}

      <div className="flex items-start gap-2">
        <p className="flex-1 text-body text-ink">{card.title}</p>
        <IconGrip
          size={16}
          className="mt-0.5 shrink-0 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>

      {hasMeta && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {due && <DueDate date={due} />}
          {card.description && (
            <span className="text-ink-faint" title="This card has a description">
              <IconDescription size={15} />
            </span>
          )}
        </div>
      )}
    </article>
  );
}

export function CardDragPreview({ title }: { title: string }) {
  return (
    <div className="ns-card ns-card--dragging w-list p-3 text-body">
      {title}
    </div>
  );
}