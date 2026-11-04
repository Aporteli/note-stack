import { ConfirmDialog } from "@/components/Board/components/ConfirmDialog";
import { EmptyState } from "@/components/ui/Feedback";
import type { useQuizBoard } from "@/components/flash/hooks/useQuizBoard";
import { QuizBreadcrumbs, QuizGroupForm } from "@/components/flash/quiz/QuizGroupBar";
import { QuizCreateForm } from "@/components/flash/quiz/QuizCreateForm";
import { QuizFolderList } from "@/components/flash/quiz/QuizFolderList";
import { QuizList } from "@/components/flash/quiz/QuizList";

type Board = ReturnType<typeof useQuizBoard>;

export function QuizLibrary({ board }: { board: Board }) {
  return (
    <div className="flex w-full flex-col gap-6">
      <QuizBreadcrumbs
        crumbs={board.crumbs}
        folderId={board.folderId}
        onOpen={board.setFolderId}
      />
      <QuizGroupForm
        folderId={board.folderId}
        name={board.groupName}
        error={board.groupError}
        pending={board.isPending}
        onName={(value) => {
          board.setGroupName(value);
          if (board.groupError) board.setGroupError("");
        }}
        onSubmit={board.handleCreateGroup}
      />
      <QuizCreateForm
        topics={board.topics}
        topicId={board.topicId}
        title={board.title}
        error={board.createError}
        pending={board.isPending}
        onTopic={board.setTopicId}
        onTitle={(value) => {
          board.setTitle(value);
          if (board.createError) board.setCreateError("");
        }}
        onSubmit={board.handleCreate}
      />
      <QuizFolderList
        folders={board.folders}
        childFolders={board.childFolders}
        quizzes={board.quizzes}
        editingFolderId={board.editingFolderId}
        folderDraft={board.folderDraft}
        onDraft={board.setFolderDraft}
        onOpen={board.setFolderId}
        onBeginRename={board.beginRenameFolder}
        onCommit={board.commitFolderName}
        onCancelRename={() => board.setEditingFolderId(null)}
        onDelete={board.removeFolder}
      />

      {board.topics.length > 0 && board.here.length === 0 && board.childFolders.length === 0 ? (
        <EmptyState
          title="Nothing in this group yet"
          body="Add a subgroup, or create a quiz and put it in this group."
        />
      ) : board.here.length > 0 ? (
        <QuizList
          quizzes={board.here}
          folders={board.folders}
          sort={board.sort}
          selecting={board.selecting}
          selectedIds={board.selectedQuizIds}
          allSelected={board.allQuizzesSelected}
          selectedCount={board.selectedQuizzes.length}
          pending={board.isPending}
          editingQuizId={board.editingQuizId}
          quizDraft={board.quizDraft}
          onSort={board.setSort}
          onToggleAll={board.toggleAllQuizzes}
          onBulkDelete={() => board.setPendingBulkDelete(true)}
          onDraft={board.setQuizDraft}
          onBeginHold={board.beginHold}
          onEndHold={board.endHold}
          onToggle={board.toggleQuiz}
          onStartRename={board.startRenameQuiz}
          onCommitRename={board.commitQuizName}
          onCancelRename={() => board.setEditingQuizId(null)}
          onMove={board.moveQuiz}
          onTake={board.setTakingId}
          onEdit={board.setEditingId}
          onDelete={board.setPendingDelete}
        />
      ) : null}

      <ConfirmDialog
        open={board.pendingDelete !== null}
        title="Delete this quiz?"
        body="The questions and answers will be removed. Flash cards stay as they are."
        confirmLabel="Delete quiz"
        tone="danger"
        busy={board.isPending}
        onCancel={() => {
          if (!board.isPending) board.setPendingDelete(null);
        }}
        onConfirm={board.confirmDelete}
      />
      <ConfirmDialog
        open={board.pendingBulkDelete}
        title={
          board.selectedQuizzes.length === 1
            ? "Delete this quiz?"
            : `Delete ${board.selectedQuizzes.length} quizzes?`
        }
        body="The questions and answers will be removed. Flash cards stay as they are."
        confirmLabel="Delete quizzes"
        tone="danger"
        busy={board.isPending}
        onCancel={() => {
          if (!board.isPending) board.setPendingBulkDelete(false);
        }}
        onConfirm={board.confirmBulkDelete}
      />
    </div>
  );
}
