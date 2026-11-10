import { Button } from "@/components/ui/Button";
import { IconTrash } from "@/components/ui/Icons";
import type { QuizFolderData, QuizListItem } from "@/app/flash-cards/actions";
import { QuizCard } from "@/components/flash/quiz/QuizCard";
import type { PointerEvent } from "react";

type Props = {
  quizzes: QuizListItem[];
  folders: QuizFolderData[];
  selecting: boolean;
  selectedIds: string[];
  allSelected: boolean;
  selectedCount: number;
  pending: boolean;
  editingQuizId: string | null;
  quizDraft: string;
  onToggleAll: () => void;
  onBulkDelete: () => void;
  onDraft: (value: string) => void;
  onBeginHold: (event: PointerEvent<HTMLElement>, quiz: QuizListItem) => void;
  onEndHold: () => void;
  onToggle: (id: string) => void;
  onStartRename: (quiz: QuizListItem) => void;
  onCommitRename: (quiz: QuizListItem) => void;
  onCancelRename: () => void;
  onMove: (quizId: string, folderId: string | null) => void;
  onTake: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (quiz: QuizListItem) => void;
};

export function QuizList({
  quizzes,
  folders,
  selecting,
  selectedIds,
  allSelected,
  selectedCount,
  pending,
  editingQuizId,
  quizDraft,
  onToggleAll,
  onBulkDelete,
  onDraft,
  onBeginHold,
  onEndHold,
  onToggle,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onMove,
  onTake,
  onEdit,
  onDelete,
}: Props) {
  return (
    <>
      <div className={`flex flex-wrap items-center justify-between gap-2 ${selecting ? "" : "hidden"}`}>
        <label className="inline-flex items-center gap-2 text-meta text-ink-soft">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onToggleAll}
            aria-label="Select all quizzes"
            className="h-4 w-4 accent-orchid"
          />
          Select all
        </label>
        <Button
          type="button"
          variant="danger"
          size="sm"
          disabled={selectedCount === 0 || pending}
          onClick={onBulkDelete}
        >
          <IconTrash size={15} />
          Delete selected
          {selectedCount > 0 ? ` (${selectedCount})` : ""}
        </Button>
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {quizzes.map((quiz) => (
          <QuizCard
            key={quiz.id}
            quiz={quiz}
            folders={folders}
            selecting={selecting}
            selected={selectedIds.includes(quiz.id)}
            editing={editingQuizId === quiz.id}
            draft={quizDraft}
            onDraft={onDraft}
            onBeginHold={onBeginHold}
            onEndHold={onEndHold}
            onToggle={onToggle}
            onStartRename={onStartRename}
            onCommitRename={onCommitRename}
            onCancelRename={onCancelRename}
            onMove={onMove}
            onTake={onTake}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </>
  );
}
