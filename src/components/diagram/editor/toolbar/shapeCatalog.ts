import type { Tool } from "@/components/diagram/types";

export const SHAPE_TOOLS: { id: Tool; label: string; title: string }[] = [
  { id: "select", label: "Select", title: "Select" },
  { id: "rect", label: "Rect", title: "Rectangle" },
  { id: "round", label: "Round", title: "Rounded rectangle" },
  { id: "ellipse", label: "Ellipse", title: "Ellipse" },
  { id: "diamond", label: "Diamond", title: "Diamond" },
  { id: "hex", label: "Hex", title: "Hexagon" },
  { id: "cylinder", label: "Cylinder", title: "Cylinder" },
  { id: "slant", label: "Slant", title: "Parallelogram" },
  { id: "text", label: "Text", title: "Text" },
];
