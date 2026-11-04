"use client";

import { useState } from "react";
import type { AnimationEvent, KeyboardEvent } from "react";
import { IconPencil, IconTrash } from "@/components/ui/Icons";
import type { FlashCardData } from "@/components/flash/lib/deck";

type Props = {
  card: FlashCardData;
  stripe: string;
  onEdit: () => void;
  onDelete: () => void;
};

export function FlipCard({ card, stripe, onEdit, onDelete }: Props) {
  const [showBack, setShowBack] = useState(false);
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");

  function flip() {
    if (phase !== "idle") return;
    setPhase("out");
  }

  function handleAnimationEnd(event: AnimationEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.animationName === "flash-out") {
      setShowBack((value) => !value);
      setPhase("in");
    } else if (event.animationName === "flash-in") {
      setPhase("idle");
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      flip();
    }
  }

  return (
    <div className="group relative h-full">
      <div
        role="button"
        tabIndex={0}
        aria-pressed={showBack}
        onClick={flip}
        onKeyDown={handleKeyDown}
        className="flash-scene"
      >
        <div
          className={`flash-turn${phase === "out" ? " is-out" : ""}${
            phase === "in" ? " is-in" : ""
          }`}
          onAnimationEnd={handleAnimationEnd}
        >
          <div
            className={`flash-face ${showBack ? "flash-face-back" : "flash-face-front"}`}
          >
            <span className="flash-stripe" style={{ background: stripe }} />
            <span className="flash-kicker"></span>
            <span className="flash-copy">{showBack ? card.back : card.front}</span>
          </div>
        </div>
      </div>

      {phase === "idle" && !showBack ? (
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
      ) : null}
    </div>
  );
}
