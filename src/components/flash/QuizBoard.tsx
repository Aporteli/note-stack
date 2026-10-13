"use client";

import { useState, useTransition } from "react";
import {
  addQuizQuestion,
  addQuizQuestions,
  createQuiz,
  deleteQuiz,
  deleteQuizQuestion,
  deleteQuizQuestions,
  deleteQuizzes,
  type QuizData,
  type QuizListItem,
} from "@/app/flash-cards/actions";
import { parseBulkQuiz, type BulkParse } from "@/components/flash/aiken";
import { ConfirmDialog } from "@/components/Board/components/ConfirmDialog";
import { FlashQuiz } from "@/components/flash/FlashQuiz";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Feedback";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { IconBack, IconCheck, IconPlus, IconTrash } from "@/components/ui/Icons";
import Link from "next/link";

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

export function QuizBoard({
  topics,
  quizzes,
}: {
  topics: { id: string; name: string }[];
  quizzes: QuizListItem[];
}) {
  const [topicId, setTopicId] = useState(topics[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [createError, setCreateError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [takingId, setTakingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<QuizListItem | null>(null);
  const [selectedQuizIds, setSelectedQuizIds] = useState<string[]>([]);
  const [pendingBulkDelete, setPendingBulkDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedQuizzes = quizzes.filter((quiz) => selectedQuizIds.includes(quiz.id));
  const allQuizzesSelected =
    quizzes.length > 0 && selectedQuizzes.length === quizzes.length;

  const editing = quizzes.find((quiz) => quiz.id === editingId) ?? null;
  const taking = quizzes.find((quiz) => quiz.id === takingId) ?? null;

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!topicId) {
      setCreateError("Create a topic before you add a quiz.");
      return;
    }
    if (!trimmed) {
      setCreateError("Name the quiz first.");
      return;
    }
    setCreateError("");
    startTransition(async () => {
      const result = await createQuiz(topicId, trimmed);
      if (!result.ok) {
        setCreateError(result.error);
        return;
      }
      setTitle("");
      setEditingId(result.id);
    });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    startTransition(async () => {
      await deleteQuiz(id);
      setSelectedQuizIds((current) => current.filter((quizId) => quizId !== id));
      if (editingId === id) setEditingId(null);
      if (takingId === id) setTakingId(null);
      setPendingDelete(null);
    });
  }

  function confirmBulkDelete() {
    const ids = selectedQuizzes.map((quiz) => quiz.id);
    if (ids.length === 0) {
      setPendingBulkDelete(false);
      return;
    }
    startTransition(async () => {
      await deleteQuizzes(ids);
      setSelectedQuizIds((current) => current.filter((quizId) => !ids.includes(quizId)));
      if (editingId && ids.includes(editingId)) setEditingId(null);
      if (takingId && ids.includes(takingId)) setTakingId(null);
      setPendingBulkDelete(false);
    });
  }

  if (taking) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <div>
          <button
            type="button"
            onClick={() => setTakingId(null)}
            className="mb-1 inline-flex items-center gap-1 text-meta font-medium text-ink-soft hover:text-ink"
          >
            <IconBack size={14} />
            All quizzes
          </button>
          <h2 className="font-display text-xl font-semibold text-ink">{taking.title}</h2>
          <p className="text-sm text-ink-soft">{taking.topicName}</p>
        </div>
        <FlashQuiz questions={taking.questions} />
      </div>
    );
  }

  if (editingId && !editing) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setEditingId(null)}
          className="mb-2 inline-flex items-center gap-1 text-meta font-medium text-ink-soft hover:text-ink"
        >
          <IconBack size={14} />
          All quizzes
        </button>
        <p className="text-sm text-ink-soft">Opening quiz…</p>
      </div>
    );
  }

  if (editing) {
    return (
      <QuizEditor
        quiz={editing}
        busy={isPending}
        onBack={() => setEditingId(null)}
        onTake={() => setTakingId(editing.id)}
        onDeleteQuestion={(id) => {
          startTransition(async () => {
            await deleteQuizQuestion(id);
          });
        }}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      {topics.length === 0 ? (
        <EmptyState
          title="Create a topic first"
          body="Quizzes live with a topic. Make one on the flash cards page, then come back to add a quiz."
          action={
            <Link
              href="/flash-cards"
              className="ns-btn ns-btn--primary"
            >
              Flash cards
            </Link>
          }
        />
      ) : (
        <form onSubmit={handleCreate} className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <select
            value={topicId}
            onChange={(event) => setTopicId(event.target.value)}
            aria-label="Topic"
            className="ns-field sm:w-48"
          >
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
          <div className="min-w-0 flex-1">
            <Input
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (createError) setCreateError("");
              }}
              placeholder="Name a new quiz"
              aria-label="New quiz name"
              invalid={Boolean(createError)}
            />
            {createError ? (
              <p className="mt-1.5 text-meta text-danger">{createError}</p>
            ) : null}
          </div>
          <Button type="submit" variant="primary" loading={isPending}>
            {!isPending && <IconPlus size={18} />}
            Create quiz
          </Button>
        </form>
      )}

      {topics.length > 0 && quizzes.length === 0 ? (
        <EmptyState
          title="No quizzes yet"
          body="Create a quiz, then add questions with a correct answer and a few wrong ones."
        />
      ) : quizzes.length > 0 ? (
        <>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="inline-flex items-center gap-2 text-meta text-ink-soft">
            <input
              type="checkbox"
              checked={allQuizzesSelected}
              onChange={() =>
                setSelectedQuizIds(allQuizzesSelected ? [] : quizzes.map((quiz) => quiz.id))
              }
              aria-label="Select all quizzes"
              className="h-4 w-4 accent-orchid"
            />
            Select all
          </label>
          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={selectedQuizzes.length === 0 || isPending}
            onClick={() => setPendingBulkDelete(true)}
          >
            <IconTrash size={15} />
            Delete selected
            {selectedQuizzes.length > 0 ? ` (${selectedQuizzes.length})` : ""}
          </Button>
        </div>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quizzes.map((quiz) => (
            <li key={quiz.id} className="ns-card flex min-h-[148px] flex-col justify-between p-4">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={selectedQuizIds.includes(quiz.id)}
                  onChange={() =>
                    setSelectedQuizIds((current) =>
                      current.includes(quiz.id)
                        ? current.filter((id) => id !== quiz.id)
                        : [...current, quiz.id],
                    )
                  }
                  aria-label={`Select ${quiz.title}`}
                  className="mt-1 h-4 w-4 shrink-0 accent-orchid"
                />
                <div className="min-w-0">
                <h2 className="font-display text-lead font-semibold text-ink">{quiz.title}</h2>
                <p className="mt-1 text-meta text-ink-soft">{quiz.topicName}</p>
                <p className="mt-1 text-meta text-ink-faint">
                  {quiz.questions.length}{" "}
                  {quiz.questions.length === 1 ? "question" : "questions"}
                </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={quiz.questions.length === 0}
                  onClick={() => setTakingId(quiz.id)}
                >
                  Take quiz
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingId(quiz.id)}
                >
                  Questions
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPendingDelete(quiz)}
                >
                  <IconTrash size={15} />
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
        </>
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this quiz?"
        body="The questions and answers will be removed. Flash cards stay as they are."
        confirmLabel="Delete quiz"
        tone="danger"
        busy={isPending}
        onCancel={() => {
          if (!isPending) setPendingDelete(null);
        }}
        onConfirm={confirmDelete}
      />
      <ConfirmDialog
        open={pendingBulkDelete}
        title={
          selectedQuizzes.length === 1
            ? "Delete this quiz?"
            : `Delete ${selectedQuizzes.length} quizzes?`
        }
        body="The questions and answers will be removed. Flash cards stay as they are."
        confirmLabel="Delete quizzes"
        tone="danger"
        busy={isPending}
        onCancel={() => {
          if (!isPending) setPendingBulkDelete(false);
        }}
        onConfirm={confirmBulkDelete}
      />
    </div>
  );
}

function QuizEditor({
  quiz,
  busy,
  onBack,
  onTake,
  onDeleteQuestion,
}: {
  quiz: QuizData;
  busy: boolean;
  onBack: () => void;
  onTake: () => void;
  onDeleteQuestion: (id: string) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [error, setError] = useState("");
  const [paste, setPaste] = useState("");
  const [pasteError, setPasteError] = useState("");
  const [pasteNote, setPasteNote] = useState("");
  const [preview, setPreview] = useState<BulkParse | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedQuestions = quiz.questions.filter((question) =>
    selectedIds.includes(question.id),
  );
  const allQuestionsSelected =
    quiz.questions.length > 0 && selectedQuestions.length === quiz.questions.length;

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((option, i) => (i === index ? value : option)));
  }

  function addOption() {
    setOptions((prev) => (prev.length >= MAX_OPTIONS ? prev : [...prev, ""]));
  }

  function removeOption(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index));
    setCorrectIndex((prev) => {
      if (prev === index) return 0;
      if (prev > index) return prev - 1;
      return prev;
    });
  }

  function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await addQuizQuestion(
        quiz.id,
        prompt,
        options.map((text, index) => ({
          text,
          correct: index === correctIndex,
        })),
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setPrompt("");
      setOptions(["", ""]);
      setCorrectIndex(0);
    });
  }

  function handlePreview(event: React.FormEvent) {
    event.preventDefault();
    setPasteError("");
    setPasteNote("");
    if (!paste.trim()) {
      setPreview(null);
      setPasteError("Paste numbered questions first.");
      return;
    }
    setPreview(parseBulkQuiz(paste));
  }

  function handleSavePasted() {
    if (!preview || preview.questions.length === 0) return;
    setPasteError("");
    setPasteNote("");
    const questions = preview.questions.map((question) => ({
      prompt: question.prompt,
      options: question.options.map((option) => ({
        text: option.text,
        correct: option.correct,
      })),
    }));
    startTransition(async () => {
      const result = await addQuizQuestions(quiz.id, questions);
      if (!result.ok) {
        setPasteError(result.error);
        return;
      }
      setPaste("");
      setPreview(null);
      setPasteNote(
        `Saved ${result.added} ${result.added === 1 ? "question" : "questions"}.`,
      );
    });
  }

  function confirmDeleteQuestions() {
    const ids = selectedQuestions.map((question) => question.id);
    if (ids.length === 0) {
      setConfirmDelete(false);
      return;
    }
    startTransition(async () => {
      await deleteQuizQuestions(ids);
      setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
      setConfirmDelete(false);
    });
  }

  const pending = busy || isPending;

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

      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-4 rounded-card border border-line bg-paper p-4 shadow-lift-1 sm:p-5"
      >
        <Field label="Question">
          {({ id, describedBy }) => (
            <Textarea
              id={id}
              aria-describedby={describedBy}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
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
                name={`correct-${quiz.id}`}
                checked={correctIndex === index}
                onChange={() => setCorrectIndex(index)}
                aria-label={`Mark answer ${index + 1} as correct`}
                className="h-4 w-4 shrink-0 accent-orchid"
              />
              <Input
                value={option}
                onChange={(event) => updateOption(index, event.target.value)}
                placeholder={`Answer ${index + 1}`}
                aria-label={`Answer ${index + 1}`}
              />
              {options.length > MIN_OPTIONS ? (
                <button
                  type="button"
                  aria-label={`Remove answer ${index + 1}`}
                  onClick={() => removeOption(index)}
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
            onClick={addOption}
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

      <form
        onSubmit={handlePreview}
        className="flex flex-col gap-4 rounded-card border border-line bg-paper p-4 shadow-lift-1 sm:p-5"
      >
        <Field
          label="Paste questions"
          hint="Number each question, add answers A–D, then ANSWER: B. You can paste as many as you want."
        >
          {({ id, describedBy }) => (
            <Textarea
              id={id}
              aria-describedby={describedBy}
              value={paste}
              onChange={(event) => {
                setPaste(event.target.value);
                setPreview(null);
                setPasteError("");
                setPasteNote("");
              }}
              placeholder={"1.რას ნიშნავს OOP?\nA. მონაცემთა ბაზის მართვის სისტემას\nB. ობიექტზე ორიენტირებულ პროგრამირებას\nC. პროგრამირების ენას\nD. ოპერაციულ სისტემას\nANSWER: B"}
              rows={12}
              className="min-h-64"
            />
          )}
        </Field>
        {pasteError ? <p className="text-meta text-danger">{pasteError}</p> : null}
        {pasteNote ? <p className="text-meta text-ink-soft">{pasteNote}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="secondary" disabled={!paste.trim() || pending}>
            Preview questions
          </Button>
          {preview && preview.questions.length > 0 ? (
            <Button type="button" variant="primary" loading={pending} onClick={handleSavePasted}>
              Save {preview.questions.length}{" "}
              {preview.questions.length === 1 ? "question" : "questions"}
            </Button>
          ) : null}
        </div>
        {preview && preview.errors.length > 0 ? (
          <ul className="flex flex-col gap-1" aria-label="Invalid questions">
            {preview.errors.map((message, index) => (
              <li key={`${index}-${message}`} className="text-meta text-danger">
                {message}
              </li>
            ))}
          </ul>
        ) : null}
        {preview && preview.questions.length > 0 ? (
          <ol className="flex flex-col gap-3">
            {preview.questions.map((question, index) => (
              <li key={`${question.number}-${index}`} className="rounded-card border border-line bg-surface/60 p-4">
                <p className="text-meta font-medium uppercase tracking-wide text-ink-faint">
                  Question {question.number}
                </p>
                <p className="quiz-copy mt-1 text-ink">{question.prompt}</p>
                <ul className="mt-3 flex flex-col gap-1.5">
                  {question.options.map((option) => (
                    <li
                      key={`${question.number}-${option.text}`}
                      className={`rounded-lg px-3 py-1.5 text-sm ${
                        option.correct ? "bg-mint/40 text-ink" : "bg-paper text-ink-soft"
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
        ) : null}
      </form>

      {quiz.questions.length > 0 ? (
        <>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="inline-flex items-center gap-2 text-meta text-ink-soft">
            <input
              type="checkbox"
              checked={allQuestionsSelected}
              onChange={() =>
                setSelectedIds(
                  allQuestionsSelected ? [] : quiz.questions.map((question) => question.id),
                )
              }
              aria-label="Select all questions"
              className="h-4 w-4 accent-orchid"
            />
            Select all
          </label>
          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={selectedQuestions.length === 0 || pending}
            onClick={() => setConfirmDelete(true)}
          >
            <IconTrash size={15} />
            Delete selected
            {selectedQuestions.length > 0 ? ` (${selectedQuestions.length})` : ""}
          </Button>
        </div>
        <ol className="flex flex-col gap-3">
          {quiz.questions.map((question, index) => (
            <li
              key={question.id}
              className="rounded-card border border-line bg-paper p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(question.id)}
                    onChange={() =>
                      setSelectedIds((current) =>
                        current.includes(question.id)
                          ? current.filter((id) => id !== question.id)
                          : [...current, question.id],
                      )
                    }
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
                  onClick={() => onDeleteQuestion(question.id)}
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
      ) : null}

      <ConfirmDialog
        open={confirmDelete}
        title={
          selectedQuestions.length === 1
            ? "Delete this question?"
            : `Delete ${selectedQuestions.length} questions?`
        }
        body="The selected questions and their answers will be removed."
        confirmLabel="Delete questions"
        tone="danger"
        busy={pending}
        onCancel={() => {
          if (!pending) setConfirmDelete(false);
        }}
        onConfirm={confirmDeleteQuestions}
      />
    </div>
  );
}
