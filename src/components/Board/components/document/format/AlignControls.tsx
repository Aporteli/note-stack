"use client";

import { MarkButton } from "@/components/Board/components/document/format/controls";
import { AlignIcon } from "@/components/Board/components/document/format/icons";
import type { FormatRun, Marks } from "@/components/Board/components/document/format/marks";

export function AlignControls({ marks, run }: { marks: Marks; run: FormatRun }) {
  return (
    <>
      <MarkButton label="Align left" active={marks.align === "left"} onClick={() => run(() => document.execCommand("justifyLeft"))}>
        <AlignIcon mode="left" />
      </MarkButton>
      <MarkButton label="Align center" active={marks.align === "center"} onClick={() => run(() => document.execCommand("justifyCenter"))}>
        <AlignIcon mode="center" />
      </MarkButton>
      <MarkButton label="Align right" active={marks.align === "right"} onClick={() => run(() => document.execCommand("justifyRight"))}>
        <AlignIcon mode="right" />
      </MarkButton>
      <MarkButton label="Justify" active={marks.align === "justify"} onClick={() => run(() => document.execCommand("justifyFull"))}>
        <AlignIcon mode="justify" />
      </MarkButton>
    </>
  );
}
