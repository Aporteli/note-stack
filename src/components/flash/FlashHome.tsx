"use client";

import { useState, useTransition, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createFlashFolder,
  createFlashTopic,
  deleteFlashFolder,
  deleteFlashTopic,
  moveFlashTopic,
  renameFlashFolder,
  renameFlashTopic,
} from "@/app/flash-cards/actions";
import type { FlashFolderData } from "@/app/flash-cards/actions";
import { ConfirmDialog } from "@/components/Board/components/ConfirmDialog";
import { flashListHref, flashTopicHref } from "@/components/flash/lib/flashHome";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Feedback";
import { Input } from "@/components/ui/Field";
import { IconBack, IconTrash } from "@/components/ui/Icons";

type Topic = {
  id: string;
  name: string;
  folderId: string | null;
  _count: { cards: number };
};

export function FlashHome({
  topics,
  folders,
  folderId,
}: {
  topics: Topic[];
  folders: FlashFolderData[];
  folderId: string | null;
}) {
  const [groupName, setGroupName] = useState("");
  const [groupError, setGroupError] = useState("");
  const [topicName, setTopicName] = useState("");
  const [topicError, setTopicError] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [folderDraft, setFolderDraft] = useState("");
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [topicDraft, setTopicDraft] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Topic | null>(null);
  const [pendingFolder, setPendingFolder] = useState<FlashFolderData | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function openFolder(id: string | null) {
    router.push(flashListHref(id));
  }

  const here = topics.filter((topic) => (topic.folderId ?? null) === folderId);
  const childFolders = folders.filter((folder) => (folder.parentId ?? null) === folderId);
  const current = folders.find((folder) => folder.id === folderId) ?? null;

  function addGroup(event: FormEvent) {
    event.preventDefault();
    const trimmed = groupName.trim();
    if (!trimmed) {
      setGroupError("Name the group first.");
      return;
    }
    setGroupError("");
    startTransition(async () => {
      const result = await createFlashFolder(trimmed, folderId);
      if (!result.ok) {
        setGroupError(result.error);
        return;
      }
      setGroupName("");
      openFolder(result.id);
    });
  }

  function addTopic(event: FormEvent) {
    event.preventDefault();
    const trimmed = topicName.trim();
    if (!trimmed) {
      setTopicError("Name the topic first.");
      return;
    }
    setTopicError("");
    startTransition(async () => {
      const result = await createFlashTopic(trimmed, folderId);
      if (!result.ok) {
        setTopicError(result.error);
        return;
      }
      setTopicName("");
    });
  }

  function beginRename(folder: FlashFolderData) {
    setFolderDraft(folder.name);
    setEditingFolderId(folder.id);
  }

  function commitRename(folder: FlashFolderData) {
    const text = folderDraft.trim();
    setEditingFolderId(null);
    if (text && text !== folder.name) {
      startTransition(async () => {
        await renameFlashFolder(folder.id, text);
      });
    }
  }

  function confirmDeleteFolder() {
    if (!pendingFolder) return;
    const folder = pendingFolder;
    startTransition(async () => {
      await deleteFlashFolder(folder.id);
      if (folderId === folder.id) openFolder(folder.parentId);
      setPendingFolder(null);
    });
  }

  function beginRenameTopic(topic: Topic) {
    setTopicDraft(topic.name);
    setEditingTopicId(topic.id);
  }

  function commitTopicName(topic: Topic) {
    const text = topicDraft.trim();
    setEditingTopicId(null);
    if (text && text !== topic.name) {
      startTransition(async () => {
        await renameFlashTopic(topic.id, text);
      });
    }
  }

  function moveTopic(topicId: string, nextFolderId: string | null) {
    startTransition(async () => {
      await moveFlashTopic(topicId, nextFolderId);
    });
  }

  function confirmDeleteTopic() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    startTransition(async () => {
      await deleteFlashTopic(id);
      setPendingDelete(null);
    });
  }

  return (
    <>
      <header className="mb-6 flex flex-col gap-2">
        {current ? (
          <Link
            href={flashListHref(current.parentId)}
            className="inline-flex w-fit items-center gap-1 text-meta font-medium text-ink-soft hover:text-ink"
          >
            <IconBack size={14} />
            {current.parentId ? "Back" : "All topics"}
          </Link>
        ) : null}
        <form onSubmit={addGroup} className="flex w-full flex-wrap gap-2 sm:w-auto">
          <Button type="submit" variant="primary" loading={pending} className="h-10 w-[130px]">
            {folderId ? "Add subgroup" : "Add group"}
          </Button>
          <Input
            value={groupName}
            onChange={(event) => {
              setGroupName(event.target.value);
              if (groupError) setGroupError("");
            }}
            placeholder={folderId ? "Name a subgroup" : "Name a group, for example Programming"}
            aria-label="New group name"
            invalid={Boolean(groupError)}
            className="h-10 sm:w-64"
          />
          {groupError ? <p className="basis-full text-meta text-danger">{groupError}</p> : null}
        </form>
        <form onSubmit={addTopic} className="flex w-full flex-wrap gap-2 sm:w-auto">
          <Button type="submit" variant="primary" loading={pending} className="h-10 w-[130px]">
            Create topic
          </Button>
          <Input
            value={topicName}
            onChange={(event) => {
              setTopicName(event.target.value);
              if (topicError) setTopicError("");
            }}
            placeholder="Name a new topic"
            aria-label="New topic name"
            invalid={Boolean(topicError)}
            className="h-10 sm:w-64"
          />
          {topicError ? <p className="basis-full text-meta text-danger">{topicError}</p> : null}
        </form>
      </header>

      {childFolders.length > 0 ? (
        <ul className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {childFolders.map((folder) => (
            <li key={folder.id} className="ns-card flex items-center justify-between gap-3 p-4">
              {editingFolderId === folder.id ? (
                <input
                  value={folderDraft}
                  autoFocus
                  onChange={(event) => setFolderDraft(event.target.value)}
                  onBlur={() => commitRename(folder)}
                  onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                    if (event.key === "Enter") event.currentTarget.blur();
                    if (event.key === "Escape") setEditingFolderId(null);
                  }}
                  className="ns-field min-w-0 flex-1"
                  aria-label="Group name"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => openFolder(folder.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="block font-display text-lead font-semibold text-ink">
                    {folder.name}
                  </span>
                  <span className="mt-1 block text-meta text-ink-faint">
                    {folders.filter((item) => item.parentId === folder.id).length} subgroups ·{" "}
                    {topics.filter((topic) => topic.folderId === folder.id).length} topics
                  </span>
                </button>
              )}
              <Button type="button" variant="ghost" size="sm" onClick={() => beginRename(folder)}>
                Rename
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setPendingFolder(folder)}>
                <IconTrash size={15} />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      {here.length === 0 && childFolders.length === 0 ? (
        <section className="rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-sm sm:p-10">
          <EmptyState
            title={folderId ? "Nothing in this group yet" : "Start your first topic"}
            body={
              folderId
                ? "Add a subgroup, or create a topic in this group."
                : "Make a topic for a subject, then open it to write cards."
            }
          />
        </section>
      ) : here.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {here.map((topic) => (
            <li key={topic.id} className="ns-card flex min-h-[148px] flex-col justify-between p-4">
              <div className="min-w-0">
                {editingTopicId === topic.id ? (
                  <input
                    value={topicDraft}
                    autoFocus
                    onChange={(event) => setTopicDraft(event.target.value)}
                    onBlur={() => commitTopicName(topic)}
                    onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                      if (event.key === "Enter") event.currentTarget.blur();
                      if (event.key === "Escape") setEditingTopicId(null);
                    }}
                    aria-label="Topic name"
                    className="ns-field w-full font-display text-lead font-semibold"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => beginRenameTopic(topic)}
                    className="block w-full text-left"
                  >
                    <h2 className="font-display text-lead font-semibold text-ink">{topic.name}</h2>
                  </button>
                )}
                <select
                  value={topic.folderId ?? ""}
                  onChange={(event) => moveTopic(topic.id, event.target.value || null)}
                  aria-label={`Group for ${topic.name}`}
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
                  {topic._count.cards} {topic._count.cards === 1 ? "card" : "cards"}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={topic._count.cards === 0}
                  onClick={() => router.push(flashTopicHref(topic.id, folderId))}
                >
                  Study
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push(flashTopicHref(topic.id, folderId))}
                >
                  Cards
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPendingDelete(topic)}
                >
                  <IconTrash size={15} />
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <ConfirmDialog
        open={pendingFolder !== null}
        title="Delete this group?"
        body="Topics and subgroups in this group move up to the group above it."
        confirmLabel="Delete group"
        tone="danger"
        busy={pending}
        onCancel={() => {
          if (!pending) setPendingFolder(null);
        }}
        onConfirm={confirmDeleteFolder}
      />
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this topic?"
        body="The cards in this topic will be removed."
        confirmLabel="Delete topic"
        tone="danger"
        busy={pending}
        onCancel={() => {
          if (!pending) setPendingDelete(null);
        }}
        onConfirm={confirmDeleteTopic}
      />
    </>
  );
}
