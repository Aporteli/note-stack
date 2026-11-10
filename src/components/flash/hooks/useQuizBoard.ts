"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { FormEvent, PointerEvent } from "react";
import {
  createQuiz,
  createQuizFolder,
  deleteQuiz,
  deleteQuizFolder,
  deleteQuizQuestion,
  deleteQuizzes,
  moveQuizToFolder,
  renameQuiz,
  renameQuizFolder,
  type QuizFolderData,
  type QuizListItem,
} from "@/app/flash-cards/actions";
import { QUIZ_HOME_EVENT, quizCrumbs, quizzesHere, type QuizSort } from "@/components/flash/lib/quizBoard";

type Args = {
  quizzes: QuizListItem[];
  folders: QuizFolderData[];
};

export function useQuizBoard({ quizzes, folders }: Args) {
  const [folderId, setFolderId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupError, setGroupError] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [folderDraft, setFolderDraft] = useState("");
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [quizDraft, setQuizDraft] = useState("");
  const [selecting, setSelecting] = useState(false);
  const holdTimer = useRef<number | null>(null);
  const heldQuiz = useRef(false);
  const [title, setTitle] = useState("");
  const [createError, setCreateError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [takingId, setTakingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<QuizListItem | null>(null);
  const [pendingFolder, setPendingFolder] = useState<QuizFolderData | null>(null);
  const [selectedQuizIds, setSelectedQuizIds] = useState<string[]>([]);
  const [pendingBulkDelete, setPendingBulkDelete] = useState(false);
  const [sort, setSort] = useState<QuizSort>("created");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function showLibrary() {
      setTakingId(null);
      setEditingId(null);
      setFolderId(null);
      setSelecting(false);
      setSelectedQuizIds([]);
      setPendingDelete(null);
      setPendingFolder(null);
      setPendingBulkDelete(false);
      setEditingFolderId(null);
      setEditingQuizId(null);
    }
    window.addEventListener(QUIZ_HOME_EVENT, showLibrary);
    return () => window.removeEventListener(QUIZ_HOME_EVENT, showLibrary);
  }, []);

  const here = quizzesHere(quizzes, folderId, sort);
  const childFolders = folders.filter((folder) => (folder.parentId ?? null) === folderId);
  const selectedQuizzes = here.filter((quiz) => selectedQuizIds.includes(quiz.id));
  const allQuizzesSelected = here.length > 0 && selectedQuizzes.length === here.length;
  const crumbs = quizCrumbs(folders, folderId);
  const editing = quizzes.find((quiz) => quiz.id === editingId) ?? null;
  const taking = quizzes.find((quiz) => quiz.id === takingId) ?? null;

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setCreateError("Name the quiz first.");
      return;
    }
    setCreateError("");
    startTransition(async () => {
      const result = await createQuiz(trimmed, folderId);
      if (!result.ok) {
        setCreateError(result.error);
        return;
      }
      setTitle("");
      setEditingId(result.id);
    });
  }

  function handleCreateGroup(event: FormEvent) {
    event.preventDefault();
    const trimmed = groupName.trim();
    if (!trimmed) {
      setGroupError("Name the group first.");
      return;
    }
    setGroupError("");
    startTransition(async () => {
      const result = await createQuizFolder(trimmed, folderId);
      if (!result.ok) {
        setGroupError(result.error);
        return;
      }
      setGroupName("");
      setFolderId(result.id);
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

  function moveQuiz(quizId: string, nextFolderId: string | null) {
    startTransition(async () => {
      await moveQuizToFolder(quizId, nextFolderId);
    });
  }

  function deleteQuestion(id: string) {
    startTransition(async () => {
      await deleteQuizQuestion(id);
    });
  }

  function confirmDeleteFolder() {
    if (!pendingFolder) return;
    const folder = pendingFolder;
    startTransition(async () => {
      await deleteQuizFolder(folder.id);
      if (folderId === folder.id) setFolderId(folder.parentId);
      setPendingFolder(null);
    });
  }

  function beginRenameFolder(folder: QuizFolderData) {
    setFolderDraft(folder.name);
    setEditingFolderId(folder.id);
  }

  function commitFolderName(folder: QuizFolderData) {
    const text = folderDraft.trim();
    setEditingFolderId(null);
    if (text && text !== folder.name) void renameQuizFolder(folder.id, text);
  }

  function beginHold(event: PointerEvent<HTMLElement>, quiz: QuizListItem) {
    const target = event.target as HTMLElement;
    if (target.closest("input, select, a")) return;
    if (target.closest("button") && !target.closest("[data-quiz-title]")) return;
    heldQuiz.current = false;
    holdTimer.current = window.setTimeout(() => {
      heldQuiz.current = true;
      setSelecting(true);
      setSelectedQuizIds((current) =>
        current.includes(quiz.id) ? current : [...current, quiz.id],
      );
    }, 2000);
  }

  function endHold() {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
  }

  function startRenameQuiz(quiz: QuizListItem) {
    if (heldQuiz.current) {
      heldQuiz.current = false;
      return;
    }
    setQuizDraft(quiz.title);
    setEditingQuizId(quiz.id);
  }

  function commitQuizName(quiz: QuizListItem) {
    const text = quizDraft.trim();
    setEditingQuizId(null);
    if (text && text !== quiz.title) void renameQuiz(quiz.id, text);
  }

  function toggleQuiz(quizId: string) {
    setSelectedQuizIds((current) => {
      const next = current.includes(quizId)
        ? current.filter((id) => id !== quizId)
        : [...current, quizId];
      if (next.length === 0) setSelecting(false);
      return next;
    });
  }

  function toggleAllQuizzes() {
    if (allQuizzesSelected) {
      setSelectedQuizIds([]);
      setSelecting(false);
      return;
    }
    setSelectedQuizIds(here.map((quiz) => quiz.id));
  }

  return {
    quizzes,
    folders,
    folderId,
    setFolderId,
    groupName,
    setGroupName,
    groupError,
    setGroupError,
    editingFolderId,
    setEditingFolderId,
    folderDraft,
    setFolderDraft,
    editingQuizId,
    setEditingQuizId,
    quizDraft,
    setQuizDraft,
    selecting,
    title,
    setTitle,
    createError,
    setCreateError,
    editingId,
    setEditingId,
    takingId,
    setTakingId,
    pendingDelete,
    setPendingDelete,
    pendingFolder,
    setPendingFolder,
    selectedQuizIds,
    pendingBulkDelete,
    setPendingBulkDelete,
    sort,
    setSort,
    isPending,
    here,
    childFolders,
    selectedQuizzes,
    allQuizzesSelected,
    crumbs,
    editing,
    taking,
    handleCreate,
    handleCreateGroup,
    confirmDelete,
    confirmBulkDelete,
    confirmDeleteFolder,
    moveQuiz,
    deleteQuestion,
    beginRenameFolder,
    commitFolderName,
    beginHold,
    endHold,
    startRenameQuiz,
    commitQuizName,
    toggleQuiz,
    toggleAllQuizzes,
  };
}
