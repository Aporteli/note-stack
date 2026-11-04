import type { QuizData } from "@/app/flash-cards/actions";
import { Button } from "@/components/ui/Button";
import { IconTrash } from "@/components/ui/Icons";

type Props = {
  questions: QuizData["questions"];
  selectedIds: string[];
  allSelected: boolean;
  selectedCount: number;
  pending: boolean;
  onToggleAll: () => void;
  onToggle: (id: string) => void;
  onDeleteSelected: () => void;
  onDelete: (id: string) => void;
};

export function QuizQuestionList({
  questions,
  selectedIds,
  allSelected,
  selectedCount,
  pending,
  onToggleAll,
  onToggle,
  onDeleteSelected,
  onDelete,
}: Props) {
  if (questions.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="inline-flex items-center gap-2 text-meta text-ink-soft">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onToggleAll}
            aria-label="Select all questions"
            className="h-4 w-4 accent-orchid"
          />
          Select all
        </label>
        <Button
          type="button"
          variant="danger"
          size="sm"
          disabled={selectedCount === 0 || pending}
          onClick={onDeleteSelected}
        >
          <IconTrash size={15} />
          Delete selected
          {selectedCount > 0 ? ` (${selectedCount})` : ""}
        </Button>
      </div>
      <ol className="flex flex-col gap-3">
        {questions.map((question, index) => (
          <li key={question.id} className="rounded-card border border-line bg-paper p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(question.id)}
                  onChange={() => onToggle(question.id)}
                  aria-label={`Select question ${index + 1}`}
                  disabled={pending}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-orchid"
                />
                <div className="min-w-0">
                  <p className="text-meta font-medium uppercase tracking-wide text-ink-faint">
                    Question {index + 1}
                  </p>
                  <p className="quiz-copy mt-1 text-ink">{question.prompt}</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Delete question"
                onClick={() => onDelete(question.id)}
                disabled={pending}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-surface hover:text-danger disabled:opacity-40"
              >
                <IconTrash size={15} />
              </button>
            </div>
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
          </li>
        ))}
      </ol>
    </>
  );
}
