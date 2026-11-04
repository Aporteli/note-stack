import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { IconCheck, IconPlus, IconTrash } from "@/components/ui/Icons";
import { MAX_OPTIONS, MIN_OPTIONS } from "@/components/flash/lib/quizBoard";

type Props = {
  quizId: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  error: string;
  pending: boolean;
  onPrompt: (value: string) => void;
  onOption: (index: number, value: string) => void;
  onCorrect: (index: number) => void;
  onRemoveOption: (index: number) => void;
  onAddOption: () => void;
  onSubmit: (event: FormEvent) => void;
};

export function QuizQuestionForm({
  quizId,
  prompt,
  options,
  correctIndex,
  error,
  pending,
  onPrompt,
  onOption,
  onCorrect,
  onRemoveOption,
  onAddOption,
  onSubmit,
}: Props) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-card border border-line bg-paper p-4 shadow-lift-1 sm:p-5"
    >
      <Field label="Question">
        {({ id, describedBy }) => (
          <Textarea
            id={id}
            aria-describedby={describedBy}
            value={prompt}
            onChange={(event) => onPrompt(event.target.value)}
            placeholder="Write the question"
            rows={3}
          />
        )}
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-meta font-semibold text-ink-soft">Answers</legend>
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="radio"
              name={`correct-${quizId}`}
              checked={correctIndex === index}
              onChange={() => onCorrect(index)}
              aria-label={`Mark answer ${index + 1} as correct`}
              className="h-4 w-4 shrink-0 accent-orchid"
            />
            <Input
              value={option}
              onChange={(event) => onOption(index, event.target.value)}
              placeholder={`Answer ${index + 1}`}
              aria-label={`Answer ${index + 1}`}
            />
            {options.length > MIN_OPTIONS ? (
              <button
                type="button"
                aria-label={`Remove answer ${index + 1}`}
                onClick={() => onRemoveOption(index)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-surface hover:text-danger"
              >
                <IconTrash size={15} />
              </button>
            ) : null}
          </div>
        ))}
        <p className="text-meta text-ink-faint">
          <IconCheck size={14} className="mr-1 inline" />
          The selected answer is the correct one.
        </p>
      </fieldset>

      {error ? <p className="text-meta text-danger">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onAddOption}
          disabled={options.length >= MAX_OPTIONS}
        >
          <IconPlus size={16} />
          Add answer
        </Button>
        <Button type="submit" variant="primary" loading={pending}>
          Add question
        </Button>
      </div>
    </form>
  );
}
