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
    image?: string | null;
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
      onDoubleClick={(e) => {
        e.stopPropagation();
        onOpen?.(card.id);
      }}
      data-item-type="card"
      data-item-id={card.id}
      className={`group mb-2 cursor-grab bg-white p-3 text-slate-800 shadow-sm active:cursor-grabbing ${
        selected ? "border-2 border-black" : "border border-slate-200"
      }`}
    >
      {card.image ? (
        <img
          src={card.image}
          alt={card.title || "Pasted picture"}
          className="mb-2 max-h-44 w-full object-contain"
        />
      ) : null}
      {card.labels && card.labels.length > 0 && (
        <div className="mb-2">
          <TagBar tones={card.labels} />
        </div>
      )}

      <div className="flex items-start gap-2">
        {card.title ? <p className="flex-1 text-sm text-slate-800">{card.title}</p> : <span className="flex-1" />}
        <IconGrip
          size={16}
          className="mt-0.5 shrink-0 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>

      {hasMeta && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {due && <DueDate date={due} />}
          {card.description && (
            <span className="text-slate-400" title="This card has a description">
              <IconDescription size={15} />
            </span>
          )}
        </div>
      )}
    </article>
  );
}

export function CardDragPreview({ title, image }: { title: string; image?: string | null }) {
  return (
    <div className="w-list border-2 border-slate-800 bg-white p-3 text-sm text-slate-800 shadow-lift-3">
      {image ? (
        <img src={image} alt={title || "Picture"} className="mb-2 max-h-44 w-full object-contain" />
      ) : null}
      {title}
    </div>
  );
}