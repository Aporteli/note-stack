"use client";

import { createPortal } from "react-dom";
import { useTrashMenu } from "@/components/Board/hooks/useTrashMenu";
import { trashConfirmBody, trashConfirmTitle } from "@/components/Board/lib/trash";
import { ConfirmDialog } from "@/components/Board/components/ConfirmDialog";
import { TrashPanel } from "@/components/Board/components/trash/TrashPanel";
import { TrashTrigger } from "@/components/Board/components/trash/TrashTrigger";

type Props = {
  boardId: string;
  /** Changes whenever the board is revalidated — used to refresh trash. */
  refreshKey: number;
};

export function TrashMenu({ boardId, refreshKey }: Props) {
  const trash = useTrashMenu(boardId, refreshKey);
  const confirm = trash.confirm;

  return (
    <>
      <TrashTrigger
        open={trash.open}
        total={trash.total}
        triggerRef={trash.triggerRef}
        onToggle={() => trash.setOpen((value) => !value)}
      />

      {trash.open && typeof document !== "undefined"
        ? createPortal(
            <TrashPanel
              panelRef={trash.panelRef}
              loading={trash.loading}
              total={trash.total}
              items={trash.allItems}
              selected={trash.selected}
              error={trash.error}
              busy={trash.busy}
              onToggleAll={trash.toggleAll}
              onToggle={trash.toggle}
              onRestore={() => trash.setConfirm("restore")}
              onPurge={() => trash.setConfirm("purge")}
            />,
            document.body,
          )
        : null}

      <ConfirmDialog
        open={confirm !== null}
        title={confirm ? trashConfirmTitle(confirm, trash.selectedItems.length) : ""}
        body={confirm ? trashConfirmBody(confirm) : ""}
        tone={confirm === "purge" ? "danger" : "default"}
        confirmLabel={confirm === "purge" ? "Delete forever" : "Restore"}
        busy={trash.busy}
        onCancel={() => trash.setConfirm(null)}
        onConfirm={confirm === "purge" ? trash.handlePurge : trash.handleRestore}
      />
    </>
  );
}
