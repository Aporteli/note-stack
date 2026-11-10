"use client";

import { MarkButton } from "@/components/Board/components/document/format/controls";
import type { FormatRun, Marks } from "@/components/Board/components/document/format/marks";

export function TextMarkControls({ marks, run }: { marks: Marks; run: FormatRun }) {
  return (
    <>
      <MarkButton label="Bold" title="Bold (Ctrl+B)" active={marks.bold} onClick={() => run(() => document.execCommand("bold"))}>
        <span className="font-bold">B</span>
      </MarkButton>
      <MarkButton label="Italic" title="Italic (Ctrl+I)" active={marks.italic} onClick={() => run(() => document.execCommand("italic"))}>
        <span className="font-serif italic">I</span>
      </MarkButton>
      <MarkButton label="Underline" title="Underline (Ctrl+U)" active={marks.underline} onClick={() => run(() => document.execCommand("underline"))}>
        <span className="underline">U</span>
      </MarkButton>
      <MarkButton label="Strikethrough" title="Strikethrough" active={marks.strike} onClick={() => run(() => document.execCommand("strikeThrough"))}>
        <span className="line-through">S</span>
      </MarkButton>
    </>
  );
}
