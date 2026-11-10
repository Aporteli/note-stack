"use client";

import { useState } from "react";
import { IconButton } from "@/components/ui/Button";
import { IconMore, IconPencil, IconPlus, IconTrash } from "@/components/ui/Icons";
import { Menu, MenuDivider, MenuItem } from "@/components/ui/Overlay";
import { stopDrag } from "@/components/Board/components/list/stopDrag";

type Props = {
  title: string;
  onAddCard: () => void;
  onRename: () => void;
  onDelete: () => void;
};

export function ListMenu({ title, onAddCard, onRename, onDelete }: Props) {
  const [open, setOpen] = useState(false);

  function choose(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <div className="relative ml-auto" onPointerDown={stopDrag}>
      <IconButton
        label={`List actions for ${title}`}
        className="!text-slate-600 hover:!bg-slate-100 hover:!text-slate-900"
        onClick={() => setOpen((value) => !value)}
      >
        <IconMore size={18} />
      </IconButton>
      <Menu open={open} onClose={() => setOpen(false)}>
        <MenuItem icon={<IconPlus size={16} />} onClick={() => choose(onAddCard)}>
          Add card
        </MenuItem>
        <MenuItem icon={<IconPencil size={16} />} onClick={() => choose(onRename)}>
          Rename list
        </MenuItem>
        <MenuDivider />
        <MenuItem icon={<IconTrash size={16} />} tone="danger" onClick={() => choose(onDelete)}>
          Delete list
        </MenuItem>
      </Menu>
    </div>
  );
}
