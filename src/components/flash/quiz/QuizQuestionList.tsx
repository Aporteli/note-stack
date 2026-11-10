import type { QuizData } from "@/app/flash-cards/actions";
import { QuizSavedQuestion } from "@/components/flash/quiz/QuizSavedQuestion";
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
          <QuizSavedQuestion
            key={question.id}
            question={question}
            index={index}
            selected={selectedIds.includes(question.id)}
            pending={pending}
            onToggle={() => onToggle(question.id)}
            onDelete={() => onDelete(question.id)}
          />
        ))}
      </ol>
    </>
  );
}
