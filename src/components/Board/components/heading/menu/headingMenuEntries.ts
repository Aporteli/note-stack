import type { ContextMenuEntry } from "@/components/Board/components/ContextMenu";
import { itemMenuEntries } from "@/components/Board/components/itemMenu/itemMenuEntries";

type Actions = {
  locked: boolean;
  cut: () => void;
  copy: () => void;
  duplicate: () => void;
  trash: () => void;
  lock: () => void;
  front: () => void;
  back: () => void;
  edit: () => void;
};

export function headingMenuEntries(actions: Actions): ContextMenuEntry[] {
  return [
    ...itemMenuEntries(actions),
    { divider: true },
    { label: "Edit", onClick: actions.edit },
  ];
}
