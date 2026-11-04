import type { KeyboardEvent, PointerEvent } from "react";
import type { QuizFolderData, QuizListItem } from "@/app/flash-cards/actions";
import { Button } from "@/components/ui/Button";
import { IconTrash } from "@/components/ui/Icons";

type Props = {
  quiz: QuizListItem;
  folders: QuizFolderData[];
  selecting: boolean;
  selected: boolean;
  editing: boolean;
  draft: string;
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

export function QuizCard({
  quiz,
  folders,
  selecting,
  selected,
  editing,
  draft,
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
    <li
      className="ns-card flex min-h-[148px] flex-col justify-between p-4"
      onPointerDown={(event) => onBeginHold(event, quiz)}
      onPointerUp={onEndHold}
      onPointerLeave={onEndHold}
      onPointerCancel={onEndHold}
    >
      <div className="flex items-start gap-2">
        {selecting ? (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggle(quiz.id)}
            aria-label={`Select ${quiz.title}`}
            className="mt-1 h-4 w-4 shrink-0 accent-orchid"
          />
        ) : null}
        <div className="min-w-0">
          {editing ? (
            <input
              value={draft}
              autoFocus
              onChange={(event) => onDraft(event.target.value)}
              onBlur={() => onCommitRename(quiz)}
              onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                if (event.key === "Enter") event.currentTarget.blur();
                if (event.key === "Escape") onCancelRename();
              }}
              aria-label="Quiz name"
              className="ns-field w-full font-display text-lead font-semibold"
            />
          ) : (
            <button
              type="button"
              data-quiz-title=""
              onClick={() => onStartRename(quiz)}
              className="block w-full text-left"
            >
              <h2 className="font-display text-lead font-semibold text-ink">{quiz.title}</h2>
            </button>
          )}
          <p className="mt-1 text-meta text-ink-soft">{quiz.topicName}</p>
          <select
            value={quiz.folderId ?? ""}
            onChange={(event) => onMove(quiz.id, event.target.value || null)}
            aria-label={`Group for ${quiz.title}`}
            className="ns-field mt-2"
          >
            <option value="">No group</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-meta text-ink-faint">
            {quiz.questions.length} {quiz.questions.length === 1 ? "question" : "questions"}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={quiz.questions.length === 0}
          onClick={() => onTake(quiz.id)}
        >
          Take quiz
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => onEdit(quiz.id)}>
          Questions
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => onDelete(quiz)}>
          <IconTrash size={15} />
          Delete
        </Button>
      </div>
    </li>
  );
}
