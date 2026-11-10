import type { KeyboardEvent } from "react";
import type { BulkQuestion } from "@/components/flash/aiken";
import { Input, Textarea } from "@/components/ui/Field";
import { IconTrash } from "@/components/ui/Icons";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

type Props = {
  question: BulkQuestion;
  index: number;
  onChange: (question: BulkQuestion) => void;
  onRemove: () => void;
};

function keepEnter(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key === "Enter") event.preventDefault();
}

export function QuizPasteQuestion({ question, index, onChange, onRemove }: Props) {
  return (
    <li className="rounded-card border border-line bg-surface/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-meta font-medium uppercase tracking-wide text-ink-faint">
          Question {question.number}
        </p>
        <button
          type="button"
          aria-label={`Remove question ${question.number}`}
          onClick={onRemove}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-paper hover:text-danger"
        >
          <IconTrash size={15} />
        </button>
      </div>
      <Textarea
        value={question.prompt}
        onChange={(event) => onChange({ ...question, prompt: event.target.value })}
        aria-label={`Question ${question.number} text`}
        rows={3}
        className="quiz-copy mt-2"
      />
      <ul className="mt-3 flex flex-col gap-2">
        {question.options.map((option, optionIndex) => (
          <li key={optionIndex} className="flex items-center gap-2">
            <input
              type="radio"
              name={`paste-correct-${index}`}
              checked={option.correct}
              onChange={() =>
                onChange({
                  ...question,
                  options: question.options.map((item, i) => ({
                    ...item,
                    correct: i === optionIndex,
                  })),
                })
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
                onChange({
                  ...question,
                  options: question.options.map((item, i) =>
                    i === optionIndex ? { ...item, text: event.target.value } : item,
                  ),
                })
              }
              onKeyDown={keepEnter}
              aria-label={`Answer ${LETTERS[optionIndex] ?? optionIndex + 1}`}
            />
          </li>
        ))}
      </ul>
    </li>
  );
}
