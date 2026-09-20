"use client";

import { useState, useTransition } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card } from "./Card";
import { createCard } from "@/app/actions";
import { Button, IconButton } from "./ui/Button";
import { Menu, MenuDivider, MenuItem } from "./ui/Overlay";
import { Textarea } from "./ui/Field";
import {
  IconClose,
  IconMore,
  IconPencil,
  IconPlus,
  IconTrash,
} from "./ui/Icons";
import { TAG_TONES } from "./ui/Tag";
import type { TagTone } from "./ui/Tag";

type ListProps = {
  list: {
    id: string;
    title: string;
    x: number;
    y: number;
    cards: { id: string; title: string }[];
  };
  boardId: string;
  index?: number;
  onOpenCard?: (id: string) => void;
  /** True when this list is in the board's selection. */
  selected?: boolean;
};

const TAB_ORDER: TagTone[] = ["orchid", "lagoon", "coral", "mint", "plum"];

function stopDrag(e: React.PointerEvent) {
  e.stopPropagation();
}

export function List({
  list,
  boardId,
  index = 0,
  onOpenCard,
  selected = false,
}: ListProps) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    setNodeRef: setDragRef,
    listeners,
    transform,
    isDragging,
  } = useDraggable({
    id: list.id,
    data: { type: "list", x: list.x, y: list.y },
    disabled: list.id.startsWith("temp-"),
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: list.id });

  const setRefs = (node: HTMLElement | null) => {
    setDragRef(node);
    setDropRef(node);
  };

  const tab = TAG_TONES[TAB_ORDER[index % TAB_ORDER.length]].dot;

  const style: React.CSSProperties = {
    position: "absolute",
    left: list.x + (transform?.x ?? 0),
    top: list.y + (transform?.y ?? 0),
    zIndex: isDragging ? 50 : selected ? 45 : 1,
    opacity: isDragging ? 0.9 : 1,
    ["--tab" as string]: tab,
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    startTransition(async () => {
      await createCard(list.id, trimmed, boardId);
      setTitle("");
      setAdding(false);
    });
  }

  return (
    <section
      ref={setRefs}
      style={style}
      {...listeners}
      aria-label={list.title}
      data-item-type="list"
      data-item-id={list.id}
      className={`
        ns-folder flex max-h-[calc(100vh-120px)] w-[296px] shrink-0
        cursor-grab flex-col p-2.5 pt-4 active:cursor-grabbing
        ${isDragging ? "shadow-lift-3" : ""}
        ${
          selected
            ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent"
            : ""
        }
      `}
    >
      <header className="flex items-center gap-2 px-1.5 pb-2">
        <h3 className="font-display text-body font-semibold text-ink">
          {list.title}
        </h3>
        <span className="rounded-pill bg-surface-sunk px-1.5 text-micro font-semibold text-ink-soft">
          {list.cards.length}
        </span>

        <div className="relative ml-auto" onPointerDown={stopDrag}>
          <IconButton
            label={`List actions for ${list.title}`}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <IconMore size={18} />
          </IconButton>
          <Menu open={menuOpen} onClose={() => setMenuOpen(false)}>
            <MenuItem icon={<IconPlus size={16} />}>Add card</MenuItem>
            <MenuItem icon={<IconPencil size={16} />}>Rename list</MenuItem>
            <MenuDivider />
            <MenuItem icon={<IconTrash size={16} />} tone="danger">
              Delete list
            </MenuItem>
          </Menu>
        </div>
      </header>

      <div
        className={`
          ns-scroll min-h-[10px] flex-1 overflow-y-auto rounded-card px-0.5
          transition-colors ${isOver ? "bg-surface-sunk" : ""}
        `}
      >
        <SortableContext
          items={list.cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {list.cards.map((card) => (
            <Card key={card.id} card={card} onOpen={onOpenCard} />
          ))}
        </SortableContext>

        {list.cards.length === 0 && !adding && (
          <p className="ns-slot grid h-16 place-items-center text-meta text-ink-faint">
            Drop a card here
          </p>
        )}
      </div>

      {adding ? (
        <form onSubmit={submit} className="mt-2" onPointerDown={stopDrag}>
          <Textarea
            autoFocus
            rows={2}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(e);
              }
              if (e.key === "Escape") setAdding(false);
            }}
            placeholder="What needs doing?"
            className="mb-2"
          />
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isPending}
            >
              Add card
            </Button>
            <IconButton label="Cancel" onClick={() => setAdding(false)}>
              <IconClose size={18} />
            </IconButton>
            <span className="ml-auto text-micro text-ink-faint">
              Enter to add
            </span>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          onPointerDown={stopDrag}
          className="ns-btn ns-btn--ghost mt-2 w-full justify-start"
        >
          <IconPlus size={18} />
          Add card
        </button>
      )}
    </section>
  );
}

/** Preview that follows the cursor while dragging an existing list. */
export function ListDragPreview({ title }: { title: string }) {
  return (
    <div className="ns-folder w-[296px] shrink-0 rotate-1 p-2.5 pt-4 shadow-lift-3">
      <header className="flex items-center gap-2 px-1.5">
        <h3 className="font-display text-body font-semibold text-ink">
          {title}
        </h3>
      </header>
    </div>
  );
}

/** Preview that follows the cursor while dragging the Add-list button. */
export function NewListPreview() {
  return (
    <div className="ns-folder w-[296px] shrink-0 rotate-1 p-2.5 pt-4 shadow-lift-3">
      <header className="flex items-center gap-2 px-1.5 pb-2">
        <h3 className="font-display text-body font-semibold text-ink/60">
          New list
        </h3>
        <span className="rounded-pill bg-surface-sunk px-1.5 text-micro font-semibold text-ink-soft">
          0
        </span>
      </header>
      <div className="mx-0.5 grid h-16 place-items-center rounded-card border-2 border-dashed border-slate-300/70 text-meta text-ink-faint">
        Drop to create
      </div>
    </div>
  );
}