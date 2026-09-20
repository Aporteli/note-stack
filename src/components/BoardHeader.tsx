"use client";

import Link from "next/link";
import { useState } from "react";
import { IconButton } from "./ui/Button";
import { SearchField } from "./ui/Field";
import { Menu, MenuDivider, MenuItem, Tooltip } from "./ui/Overlay";
import {
  IconBack,
  IconFilter,
  IconMore,
  IconPencil,
  IconTrash,
} from "./ui/Icons";

/** Sits on the canvas, so everything in it is inverted and semi-transparent. */
export function BoardHeader({
  title,
  members = ["Giorgi K", "Nino T", "Luka B", "Ana M"],
}: {
  title: string;
  members?: string[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex h-[var(--topbar-h)] shrink-0 items-center gap-3 border-b border-white/15 bg-black/10 px-3 backdrop-blur-sm sm:px-4">
      <Tooltip label="All boards">
        <Link
          href="/"
          aria-label="All boards"
          className="ns-iconbtn text-ink-invert/80 hover:bg-white/20 hover:text-ink-invert"
        >
          <IconBack />
        </Link>
      </Tooltip>

      <h1 className="font-display truncate text-lead font-semibold text-ink-invert">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-2">
        <SearchField
          onCanvas
          placeholder="Search cards"
          aria-label="Search cards on this board"
          className="hidden w-56 md:block"
        />

        <IconButton label="Filter cards" onCanvas>
          <IconFilter />
        </IconButton>

        <div className="relative">
          <IconButton
            label="Board menu"
            onCanvas
            onClick={() => setMenuOpen((v) => !v)}
          >
            <IconMore />
          </IconButton>
          <Menu open={menuOpen} onClose={() => setMenuOpen(false)}>
            <MenuItem icon={<IconPencil size={16} />}>Rename board</MenuItem>
            <MenuDivider />
            <MenuItem icon={<IconTrash size={16} />} tone="danger">
              Delete board
            </MenuItem>
          </Menu>
        </div>
      </div>
    </header>
  );
}
