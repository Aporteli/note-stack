import type { KeyboardEvent } from "react";
import type { QuizFolderData, QuizListItem } from "@/app/flash-cards/actions";
import { Button } from "@/components/ui/Button";
import { IconTrash } from "@/components/ui/Icons";

type Props = {
  folders: QuizFolderData[];
  childFolders: QuizFolderData[];
  quizzes: QuizListItem[];
  editingFolderId: string | null;
  folderDraft: string;
  onDraft: (value: string) => void;
  onOpen: (id: string) => void;
  onBeginRename: (folder: QuizFolderData) => void;
  onCommit: (folder: QuizFolderData) => void;
  onCancelRename: () => void;
  onDelete: (folder: QuizFolderData) => void;
};

export function QuizFolderList({
  folders,
  childFolders,
  quizzes,
  editingFolderId,
  folderDraft,
  onDraft,
  onOpen,
  onBeginRename,
  onCommit,
  onCancelRename,
  onDelete,
}: Props) {
  if (childFolders.length === 0) return null;

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {childFolders.map((folder) => (
        <li key={folder.id} className="ns-card flex items-center justify-between gap-3 p-4">
          {editingFolderId === folder.id ? (
            <input
              value={folderDraft}
              autoFocus
              onChange={(event) => onDraft(event.target.value)}
              onBlur={() => onCommit(folder)}
              onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                if (event.key === "Enter") event.currentTarget.blur();
                if (event.key === "Escape") onCancelRename();
              }}
              className="ns-field min-w-0 flex-1"
              aria-label="Group name"
            />
          ) : (
            <button
              type="button"
              onClick={() => onOpen(folder.id)}
              className="min-w-0 flex-1 text-left"
            >
              <span className="block font-display text-lead font-semibold text-ink">
                {folder.name}
              </span>
              <span className="mt-1 block text-meta text-ink-faint">
                {folders.filter((item) => item.parentId === folder.id).length} subgroups ·{" "}
                {quizzes.filter((quiz) => quiz.folderId === folder.id).length} quizzes
              </span>
            </button>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={() => onBeginRename(folder)}>
            Rename
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => onDelete(folder)}>
            <IconTrash size={15} />
          </Button>
        </li>
      ))}
    </ul>
  );
}
