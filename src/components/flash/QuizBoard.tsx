"use client";

import type { QuizFolderData, QuizListItem } from "@/app/flash-cards/actions";
import { useQuizBoard } from "@/components/flash/hooks/useQuizBoard";
import { QuizEditor } from "@/components/flash/quiz/QuizEditor";
import { QuizLibrary } from "@/components/flash/quiz/QuizLibrary";
import { QuizOpening, QuizTakeView } from "@/components/flash/quiz/QuizViews";

export function QuizBoard({
  quizzes,
  folders,
}: {
  quizzes: QuizListItem[];
  folders: QuizFolderData[];
}) {
  const board = useQuizBoard({ quizzes, folders });

  if (board.taking) {
    return <QuizTakeView quiz={board.taking} onBack={() => board.setTakingId(null)} />;
  }

  if (board.editingId && !board.editing) {
    return <QuizOpening onBack={() => board.setEditingId(null)} />;
  }

  const editing = board.editing;
  if (editing) {
    return (
      <QuizEditor
        quiz={editing}
        busy={board.isPending}
        onBack={() => board.setEditingId(null)}
        onTake={() => board.setTakingId(editing.id)}
        onDeleteQuestion={board.deleteQuestion}
      />
    );
  }

  return <QuizLibrary board={board} />;
}
