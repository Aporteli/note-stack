"use client";

import type { QuizData } from "@/app/flash-cards/actions";
import { ConfirmDialog } from "@/components/Board/components/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { IconBack } from "@/components/ui/Icons";
import { useQuizEditor } from "@/components/flash/hooks/useQuizEditor";
import { QuizPasteForm } from "@/components/flash/quiz/QuizPasteForm";
import { QuizQuestionForm } from "@/components/flash/quiz/QuizQuestionForm";
import { QuizQuestionList } from "@/components/flash/quiz/QuizQuestionList";

type Props = {
  quiz: QuizData;
  busy: boolean;
  onBack: () => void;
  onTake: () => void;
  onDeleteQuestion: (id: string) => void;
};

export function QuizEditor({ quiz, busy, onBack, onTake, onDeleteQuestion }: Props) {
  const editor = useQuizEditor(quiz, busy);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="mb-1 inline-flex items-center gap-1 text-meta font-medium text-ink-soft hover:text-ink"
          >
            <IconBack size={14} />
            All quizzes
          </button>
          <h2 className="font-display text-xl font-semibold text-ink">{quiz.title}</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Write a question, add the answers, and mark the correct one.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          disabled={quiz.questions.length === 0}
          onClick={onTake}
        >
          Take quiz
        </Button>
      </div>

      <QuizQuestionForm
        quizId={quiz.id}
        prompt={editor.prompt}
        options={editor.options}
        correctIndex={editor.correctIndex}
        error={editor.error}
        pending={editor.pending}
        onPrompt={editor.setPrompt}
        onOption={editor.updateOption}
        onCorrect={editor.setCorrectIndex}
        onRemoveOption={editor.removeOption}
        onAddOption={editor.addOption}
        onSubmit={editor.handleAdd}
      />

      <QuizPasteForm
        paste={editor.paste}
        error={editor.pasteError}
        note={editor.pasteNote}
        preview={editor.preview}
        pending={editor.pending}
        onPaste={editor.changePaste}
        onPreview={editor.handlePreview}
        onSave={editor.handleSavePasted}
      />

      <QuizQuestionList
        questions={quiz.questions}
        selectedIds={editor.selectedIds}
        allSelected={editor.allQuestionsSelected}
        selectedCount={editor.selectedQuestions.length}
        pending={editor.pending}
        onToggleAll={editor.toggleAllQuestions}
        onToggle={editor.toggleQuestion}
        onDeleteSelected={() => editor.setConfirmDelete(true)}
        onDelete={onDeleteQuestion}
      />

      <ConfirmDialog
        open={editor.confirmDelete}
        title={
          editor.selectedQuestions.length === 1
            ? "Delete this question?"
            : `Delete ${editor.selectedQuestions.length} questions?`
        }
        body="The selected questions and their answers will be removed."
        confirmLabel="Delete questions"
        tone="danger"
        busy={editor.pending}
        onCancel={() => {
          if (!editor.pending) editor.setConfirmDelete(false);
        }}
        onConfirm={editor.confirmDeleteQuestions}
      />
    </div>
  );
}
