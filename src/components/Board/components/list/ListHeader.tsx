"use client";

import { trashItems } from "@/app/actions";
import { ListMenu } from "@/components/Board/components/list/ListMenu";
import { ListTitle } from "@/components/Board/components/list/ListTitle";

type Props = {
  listId: string;
  boardId: string;
  title: string;
  count: number;
  renaming: boolean;
  onRenamingChange: (renaming: boolean) => void;
  onAddCard: () => void;
  onRename?: (id: string, title: string) => void;
  onDelete?: (id: string) => void;
};

export function ListHeader({
  listId,
  boardId,
  title,
  count,
  renaming,
  onRenamingChange,
  onAddCard,
  onRename,
  onDelete,
}: Props) {
  function removeList() {
    onDelete?.(listId);
    void trashItems([{ type: "list", id: listId }], boardId);
  }

  return (
    <header className="flex items-center gap-2 px-1.5 pb-2">
      <ListTitle
        listId={listId}
        boardId={boardId}
        title={title}
        editing={renaming}
        onEditingChange={onRenamingChange}
        onRename={onRename}
      />
      <span className="bg-slate-100 px-1.5 text-micro font-semibold text-slate-500">
        {count}
      </span>
      <ListMenu
        title={title}
        onAddCard={onAddCard}
        onRename={() => onRenamingChange(true)}
        onDelete={removeList}
      />
    </header>
  );
}
