"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import {
  addQuizQuestion,
  addQuizQuestions,
  deleteQuizQuestions,
  type QuizData,
} from "@/app/flash-cards/actions";
import { parseBulkQuiz, type BulkParse, type BulkQuestion } from "@/components/flash/aiken";
import { MAX_OPTIONS } from "@/components/flash/lib/quizBoard";

export function useQuizEditor(quiz: QuizData, busy: boolean) {
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

  const selectedQuestions = quiz.questions.filter((question) => selectedIds.includes(question.id));
  const allQuestionsSelected =
    quiz.questions.length > 0 && selectedQuestions.length === quiz.questions.length;
  const pending = busy || isPending;

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

  function handleAdd(event: FormEvent) {
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

  function handlePreview(event: FormEvent) {
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
      setPasteNote(`Saved ${result.added} ${result.added === 1 ? "question" : "questions"}.`);
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

  function toggleQuestion(questionId: string) {
    setSelectedIds((current) =>
      current.includes(questionId)
        ? current.filter((id) => id !== questionId)
        : [...current, questionId],
    );
  }

  function toggleAllQuestions() {
    setSelectedIds(allQuestionsSelected ? [] : quiz.questions.map((question) => question.id));
  }

  function changePreviewQuestion(index: number, question: BulkQuestion) {
    setPreview((current) => {
      if (!current) return current;
      return {
        ...current,
        questions: current.questions.map((item, i) => (i === index ? question : item)),
      };
    });
  }

  function removePreviewQuestion(index: number) {
    setPreview((current) => {
      if (!current) return current;
      return {
        ...current,
        questions: current.questions.filter((_, i) => i !== index),
      };
    });
  }

  function changePaste(value: string) {
    setPaste(value);
    setPreview(null);
    setPasteError("");
    setPasteNote("");
  }

  return {
    quiz,
    prompt,
    setPrompt,
    options,
    correctIndex,
    setCorrectIndex,
    error,
    paste,
    pasteError,
    pasteNote,
    preview,
    selectedIds,
    selectedQuestions,
    allQuestionsSelected,
    confirmDelete,
    setConfirmDelete,
    pending,
    updateOption,
    addOption,
    removeOption,
    handleAdd,
    handlePreview,
    handleSavePasted,
    changePreviewQuestion,
    removePreviewQuestion,
    confirmDeleteQuestions,
    toggleQuestion,
    toggleAllQuestions,
    changePaste,
  };
}
