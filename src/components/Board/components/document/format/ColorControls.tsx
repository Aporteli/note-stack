"use client";

import { TEXT_COLORS, TEXT_HIGHLIGHTS } from "@/components/Board/lib/richText";
import { ColorButton } from "@/components/Board/components/document/format/controls";
import type { FormatRun } from "@/components/Board/components/document/format/marks";

type Menu = "color" | "highlight" | null;

export function ColorControls({
  menu,
  setMenu,
  run,
}: {
  menu: Menu;
  setMenu: (value: Menu) => void;
  run: FormatRun;
}) {
  return (
    <>
      <ColorButton
        label="Text color"
        letter="A"
        open={menu === "color"}
        colors={TEXT_COLORS}
        onToggle={() => setMenu(menu === "color" ? null : "color")}
        onPick={(color) => {
          setMenu(null);
          run(() => document.execCommand("foreColor", false, color));
        }}
      />
      <ColorButton
        label="Highlight"
        letter="H"
        open={menu === "highlight"}
        colors={TEXT_HIGHLIGHTS}
        onToggle={() => setMenu(menu === "highlight" ? null : "highlight")}
        onPick={(color) => {
          setMenu(null);
          run(() => {
            const applied = document.execCommand("hiliteColor", false, color);
            if (!applied) document.execCommand("backColor", false, color);
          });
        }}
        onClear={() => {
          setMenu(null);
          run(() => document.execCommand("hiliteColor", false, "transparent"));
        }}
      />
    </>
  );
}
