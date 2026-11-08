"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useBoardTools } from "@/components/Board/components/document/boardTools";
import { UndoIcon } from "@/components/Board/components/document/ToolIcons";
import {
  TEXT_COLORS,
  TEXT_FONTS,
  TEXT_HIGHLIGHTS,
  TEXT_SIZES,
  applyBlock,
  applyFontSize,
  editRichText,
  rememberSelection,
} from "@/components/Board/lib/richText";

type Marks = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  align: "left" | "center" | "right" | "justify";
  block: "p" | "h1" | "h2" | "h3";
  size: string;
  font: string;
};

const EMPTY_MARKS: Marks = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  align: "left",
  block: "p",
  size: "15",
  font: TEXT_FONTS[0].value,
};

function commandState(command: string): boolean {
  try {
    return document.queryCommandState(command);
  } catch {
    return false;
  }
}

function readMarks(editor: HTMLElement | null): Marks {
  if (!editor) return EMPTY_MARKS;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return EMPTY_MARKS;
  if (!editor.contains(selection.anchorNode)) return EMPTY_MARKS;

  const node = selection.anchorNode;
  const element = node instanceof Element ? node : node?.parentElement ?? null;
  if (!element) return EMPTY_MARKS;
  const style = window.getComputedStyle(element);
  const weight = Number.parseInt(style.fontWeight, 10);
  const decoration = style.textDecorationLine || style.textDecoration;
  const align = style.textAlign;
  const family = style.fontFamily.toLowerCase().replace(/["']/g, "");
  const font = TEXT_FONTS.find((item) => family.includes(item.value.toLowerCase()))?.value ?? TEXT_FONTS[0].value;
  const size = String(Math.round(Number.parseFloat(style.fontSize)) || 15);

  let block: Marks["block"] = "p";
  let cursor: Element | null = element;
  while (cursor && cursor !== editor) {
    const tag = cursor.tagName.toLowerCase();
    if (tag === "h1" || tag === "h2" || tag === "h3") {
      block = tag;
      break;
    }
    cursor = cursor.parentElement;
  }

  const nextAlign: Marks["align"] =
    align === "center" || align === "right" || align === "justify"
      ? align
      : align === "end"
        ? "right"
        : "left";

  return {
    bold: weight >= 600 || commandState("bold"),
    italic: style.fontStyle === "italic" || commandState("italic"),
    underline: decoration.includes("underline") || commandState("underline"),
    strike: decoration.includes("line-through") || commandState("strikeThrough"),
    align: nextAlign,
    block,
    size,
    font,
  };
}

function sameMarks(a: Marks, b: Marks) {
  return (
    a.bold === b.bold &&
    a.italic === b.italic &&
    a.underline === b.underline &&
    a.strike === b.strike &&
    a.align === b.align &&
    a.block === b.block &&
    a.size === b.size &&
    a.font === b.font
  );
}

export function FormatToolbar({ hint = "Open a document to format text" }: { hint?: string }) {
  const { editor, syncEditor, prepareRef } = useBoardTools();
  const [marks, setMarks] = useState<Marks>(EMPTY_MARKS);
  const [menu, setMenu] = useState<"color" | "highlight" | null>(null);
  const rangeRef = useRef<Range | null>(null);
  const barRef = useRef<HTMLFieldSetElement>(null);

  useEffect(() => {
    const update = () => {
      const next = readMarks(editor);
      setMarks((prev) => (sameMarks(prev, next) ? prev : next));
    };
    document.addEventListener("selectionchange", update);
    update();
    return () => document.removeEventListener("selectionchange", update);
  }, [editor]);

  useEffect(() => {
    if (!menu) return;
    const close = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (barRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest("[data-format-menu]")) return;
      setMenu(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menu]);

  function run(edit: () => void) {
    if (!editor) return;
    prepareRef.current();
    editRichText(editor, rangeRef.current, edit);
    rangeRef.current = rememberSelection(editor);
    syncEditor();
    setMarks(readMarks(editor));
  }

  const sizeValue = (TEXT_SIZES as readonly number[]).includes(Number(marks.size)) ? marks.size : "";

  return (
    <fieldset
      ref={barRef}
      role="toolbar"
      aria-label="Text formatting"
      disabled={!editor}
      title={editor ? undefined : hint}
      onMouseDownCapture={() => {
        rangeRef.current = rememberSelection(editor);
      }}
      className="m-0 flex min-w-max flex-wrap items-center gap-1 border-0 p-0 disabled:opacity-70"
    >
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

      <Divider />
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

      <Divider />
      <ColorButton
        label="Text color"
        letter="A"
        open={menu === "color"}
        colors={TEXT_COLORS}
        onToggle={() => setMenu((current) => (current === "color" ? null : "color"))}
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
        onToggle={() => setMenu((current) => (current === "highlight" ? null : "highlight"))}
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

      <Divider />
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

      <Divider />
      <MarkButton label="Bulleted list" onClick={() => run(() => document.execCommand("insertUnorderedList"))}>
        <ListIcon ordered={false} />
      </MarkButton>
      <MarkButton label="Numbered list" onClick={() => run(() => document.execCommand("insertOrderedList"))}>
        <ListIcon ordered />
      </MarkButton>
      <MarkButton label="Decrease indent" onClick={() => run(() => document.execCommand("outdent"))}>
        <IndentIcon out />
      </MarkButton>
      <MarkButton label="Increase indent" onClick={() => run(() => document.execCommand("indent"))}>
        <IndentIcon />
      </MarkButton>

      <Divider />
      <MarkButton label="Clear formatting" onClick={() => run(() => document.execCommand("removeFormat"))}>
        <ClearIcon />
      </MarkButton>
      <MarkButton label="Undo" title="Undo (Ctrl+Z)" onClick={() => run(() => document.execCommand("undo"))}>
        <UndoIcon />
      </MarkButton>
      <MarkButton label="Redo" title="Redo (Ctrl+Y)" onClick={() => run(() => document.execCommand("redo"))}>
        <span className="inline-grid scale-x-[-1]">
          <UndoIcon />
        </span>
      </MarkButton>
    </fieldset>
  );
}

const selectClass =
  "h-7 rounded-md bg-white px-1.5 text-xs text-slate-700 ring-1 ring-slate-200 outline-none hover:bg-slate-50 disabled:cursor-not-allowed";

function Divider() {
  return <span className="mx-0.5 h-5 w-px shrink-0 bg-slate-200" aria-hidden />;
}

function MarkButton({
  label,
  title,
  active,
  onClick,
  children,
}: {
  label: string;
  title?: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title ?? label}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`grid h-7 min-w-7 place-items-center rounded-md px-1 text-[13px] text-slate-700 transition-colors disabled:cursor-not-allowed ${
        active ? "bg-slate-900 text-white" : "hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function ColorButton({
  label,
  letter,
  open,
  colors,
  onToggle,
  onPick,
  onClear,
}: {
  label: string;
  letter: string;
  open: boolean;
  colors: readonly string[];
  onToggle: () => void;
  onPick: (color: string) => void;
  onClear?: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [box, setBox] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open || !buttonRef.current) {
      setBox(null);
      return;
    }
    const rect = buttonRef.current.getBoundingClientRect();
    setBox({ top: rect.bottom + 6, left: rect.left });
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        title={label}
        aria-expanded={open}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onToggle}
        className={`grid h-7 min-w-7 place-items-center rounded-md text-[13px] font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed ${
          letter === "H" ? "bg-yellow-100" : ""
        }`}
      >
        <span className={letter === "A" ? "border-b-2 border-red-500 leading-none" : "leading-none"}>
          {letter}
        </span>
      </button>
      {open && box
        ? createPortal(
            <div
              data-format-menu
              style={{ top: box.top, left: box.left }}
              onMouseDown={(event) => {
                if (event.target instanceof HTMLInputElement) return;
                event.preventDefault();
              }}
              className="fixed z-[250] grid w-[148px] grid-cols-5 gap-1.5 rounded-lg border border-slate-200 bg-white p-2 shadow-lg"
            >
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={color}
                  onClick={() => onPick(color)}
                  className="h-5 w-5 rounded-full ring-1 ring-slate-200"
                  style={{ background: color }}
                />
              ))}
              <label className="col-span-5 mt-1 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                Custom
                <input
                  type="color"
                  aria-label={`Custom ${label}`}
                  onChange={(event) => onPick(event.target.value)}
                  className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
                />
              </label>
              {onClear ? (
                <button
                  type="button"
                  onClick={onClear}
                  className="col-span-5 rounded-md px-1 py-1 text-left text-[11px] text-slate-600 hover:bg-slate-100"
                >
                  No highlight
                </button>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function AlignIcon({ mode }: { mode: "left" | "center" | "right" | "justify" }) {
  const widths = mode === "justify" ? [12, 12, 12] : mode === "center" ? [8, 12, 8] : mode === "right" ? [8, 12, 6] : [12, 8, 10];
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      {widths.map((width, index) => (
        <rect
          key={index}
          x={mode === "right" ? 14 - width : mode === "center" ? (16 - width) / 2 : 2}
          y={3 + index * 4}
          width={width}
          height="1.6"
          rx="0.8"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

function ListIcon({ ordered }: { ordered: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      {ordered ? (
        <text x="1" y="7" fontSize="6" fontFamily="sans-serif">
          1
        </text>
      ) : (
        <circle cx="3" cy="4" r="1.2" />
      )}
      {ordered ? (
        <text x="1" y="13" fontSize="6" fontFamily="sans-serif">
          2
        </text>
      ) : (
        <circle cx="3" cy="11" r="1.2" />
      )}
      <rect x="6" y="3.2" width="8" height="1.5" rx="0.7" />
      <rect x="6" y="10.2" width="8" height="1.5" rx="0.7" />
    </svg>
  );
}

function IndentIcon({ out = false }: { out?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M2 3.5h12M8 6.5h6M8 9.5h6M2 12.5h12" />
      <path d={out ? "M5.5 8H2.5M4 6.5 2.5 8 4 9.5" : "M2.5 8h3M4 6.5 5.5 8 4 9.5"} />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M3 13.5 12.5 4" />
      <path d="M5 12.5h6" />
      <path d="M6.2 4.2h3.2L12 8.2 8.2 12H5L6.2 4.2z" />
    </svg>
  );
}
