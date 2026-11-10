import { TEXT_FONTS } from "@/components/Board/lib/richText";

export type Marks = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  align: "left" | "center" | "right" | "justify";
  block: "p" | "h1" | "h2" | "h3";
  size: string;
  font: string;
};

export const EMPTY_MARKS: Marks = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  align: "left",
  block: "p",
  size: "15",
  font: TEXT_FONTS[0].value,
};

export type FormatRun = (edit: () => void) => void;

function commandState(command: string): boolean {
  try {
    return document.queryCommandState(command);
  } catch {
    return false;
  }
}

export function readMarks(editor: HTMLElement | null): Marks {
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

export function sameMarks(a: Marks, b: Marks) {
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
