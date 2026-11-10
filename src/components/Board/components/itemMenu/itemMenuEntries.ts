import type { ContextMenuEntry } from "@/components/Board/components/ContextMenu";

type Actions = {
  locked: boolean;
  cut: () => void;
  copy: () => void;
  duplicate: () => void;
  trash: () => void;
  lock: () => void;
  front: () => void;
  back: () => void;
};

export function itemMenuEntries(actions: Actions): ContextMenuEntry[] {
  return [
    { label: "Cut", shortcut: "Ctrl X", onClick: actions.cut },
    { label: "Copy", shortcut: "Ctrl C", onClick: actions.copy },
    { label: "Duplicate", shortcut: "Ctrl D", onClick: actions.duplicate },
    { label: "Move to Trash", shortcut: "Backspace", danger: true, onClick: actions.trash },
    { divider: true },
    { label: actions.locked ? "Unlock Position" : "Lock Position", onClick: actions.lock },
    { divider: true },
    { label: "Bring to Front", onClick: actions.front },
    { label: "Send to Back", onClick: actions.back },
  ];
}
