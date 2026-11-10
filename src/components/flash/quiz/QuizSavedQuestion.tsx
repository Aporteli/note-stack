"use client";

import { useState, useTransition, type KeyboardEvent } from "react";
import { updateQuizQuestion, type QuizQuestionData } from "@/app/flash-cards/actions";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { IconPencil, IconTrash } from "@/components/ui/Icons";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

type Props = {
  question: QuizQuestionData;
  index: number;
  selected: boolean;
  pending: boolean;
  onToggle: () => void;
  onDelete: () => void;
};

function keepEnter(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key === "Enter") event.preventDefault();
}

export function QuizSavedQuestion({
  question,
  index,
  selected,
  pending,
  onToggle,
  onDelete,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [prompt, setPrompt] = useState(question.prompt);
  const [options, setOptions] = useState(() =>
    question.options.map((option) => ({ text: option.text, correct: option.correct })),
  );
  const [error, setError] = useState("");
  const [saving, startSaving] = useTransition();
  const busy = pending || saving;

  function beginEdit() {
    setPrompt(question.prompt);
    setOptions(question.options.map((option) => ({ text: option.text, correct: option.correct })));
    setError("");
    setEditing(true);
  }

  function save() {
    if (options.some((option) => option.text.trim().length === 0)) {
      setError("Fill in every answer.");
      return;
    }
    setError("");
    startSaving(async () => {
      const result = await updateQuizQuestion(question.id, prompt, options);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEditing(false);
    });
  }

  return (
    <li className="rounded-card border border-line bg-paper p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            aria-label={`Select question ${index + 1}`}
            disabled={busy}
            className="mt-0.5 h-4 w-4 shrink-0 accent-orchid"
          />
          <p className="text-meta font-medium uppercase tracking-wide text-ink-faint">
            Question {index + 1}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            aria-label={`Edit question ${index + 1}`}
            onClick={beginEdit}
            disabled={busy || editing}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-surface hover:text-ink disabled:opacity-40"
          >
            <IconPencil size={15} />
          </button>
          <button
            type="button"
            aria-label="Delete question"
            onClick={onDelete}
            disabled={busy}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-surface hover:text-danger disabled:opacity-40"
          >
            <IconTrash size={15} />
          </button>
        </div>
      </div>

      {editing ? (
        <div className="mt-3 flex flex-col gap-3">
          <Textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            aria-label={`Question ${index + 1} text`}
            rows={3}
            className="quiz-copy"
          />
          <ul className="flex flex-col gap-2">
            {options.map((option, optionIndex) => (
              <li key={optionIndex} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`saved-correct-${question.id}`}
                  checked={option.correct}
                  onChange={() =>
                    setOptions((current) =>
                      current.map((item, i) => ({ ...item, correct: i === optionIndex })),
                    )
                  }
                  aria-label={`Mark answer ${LETTERS[optionIndex] ?? optionIndex + 1} as correct`}
                  className="h-4 w-4 shrink-0 accent-orchid"
                />
                <span className="w-4 shrink-0 text-meta font-semibold text-ink-faint">
                  {LETTERS[optionIndex] ?? optionIndex + 1}
                </span>
                <Input
                  value={option.text}
                  onChange={(event) =>
                    setOptions((current) =>
                      current.map((item, i) =>
                        i === optionIndex ? { ...item, text: event.target.value } : item,
                      ),
                    )
                  }
                  onKeyDown={keepEnter}
                  aria-label={`Answer ${LETTERS[optionIndex] ?? optionIndex + 1}`}
                />
              </li>
            ))}
          </ul>
          {error ? <p className="text-meta text-danger">{error}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="primary" size="sm" loading={saving} onClick={save}>
              Save question
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={saving}
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="quiz-copy mt-2 text-ink">{question.prompt}</p>
          <ul className="mt-3 flex flex-col gap-1.5">
            {question.options.map((option) => (
              <li
                key={option.id}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  option.correct ? "bg-mint/40 text-ink" : "bg-surface text-ink-soft"
                }`}
              >
                {option.correct ? "Correct · " : ""}
                {option.text}
              </li>
            ))}
          </ul>
        </>
      )}
    </li>
  );
}
