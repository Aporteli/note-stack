"use client";

import { TEXT_FONTS, TEXT_SIZES, applyBlock, applyFontSize } from "@/components/Board/lib/richText";
import { selectClass } from "@/components/Board/components/document/format/controls";
import type { FormatRun, Marks } from "@/components/Board/components/document/format/marks";

export function StyleControls({
  marks,
  editor,
  run,
}: {
  marks: Marks;
  editor: HTMLElement | null;
  run: FormatRun;
}) {
  const sizeValue = (TEXT_SIZES as readonly number[]).includes(Number(marks.size)) ? marks.size : "";

  return (
    <>
      <select
        aria-label="Style"
        title="Style"
        value={marks.block}
        onChange={(event) => {
          const value = event.target.value;
          if (value === "p" || value === "h1" || value === "h2" || value === "h3") {
            run(() => applyBlock(value));
          }
        }}
        className={selectClass}
      >
        <option value="p">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>
      <select
        aria-label="Font"
        title="Font"
        value={marks.font}
        onChange={(event) => {
          const value = event.target.value;
          run(() => document.execCommand("fontName", false, value));
        }}
        className={selectClass}
      >
        {TEXT_FONTS.map((font) => (
          <option key={font.value} value={font.value}>
            {font.label}
          </option>
        ))}
      </select>
      <select
        aria-label="Font size"
        title="Font size"
        value={sizeValue}
        onChange={(event) => {
          const px = Number(event.target.value);
          if (!px || !editor) return;
          run(() => applyFontSize(editor, px));
        }}
        className={`${selectClass} w-16`}
      >
        {sizeValue === "" ? <option value="">—</option> : null}
        {TEXT_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </>
  );
}
