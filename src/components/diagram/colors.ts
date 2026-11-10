import type { ShapeFill, ShapeStroke } from "@/components/diagram/types";

export const FILL_COLOR: Record<ShapeFill, string> = {
  paper: "var(--color-paper)",
  surface: "var(--color-surface)",
  coral: "var(--color-coral)",
  lagoon: "var(--color-lagoon)",
  mint: "var(--color-mint)",
  orchid: "var(--color-orchid)",
};

export const SWATCH_COLOR: Record<ShapeFill | ShapeStroke, string> = {
  paper: "var(--color-paper)",
  surface: "var(--color-surface)",
  ink: "var(--color-ink)",
  coral: "var(--color-coral)",
  lagoon: "var(--color-lagoon)",
  mint: "var(--color-mint)",
  orchid: "var(--color-orchid)",
};

export const STROKE_COLOR: Record<ShapeStroke, string> = {
  ink: "var(--color-ink)",
  coral: "var(--color-coral)",
  lagoon: "var(--color-lagoon)",
  mint: "var(--color-mint)",
  orchid: "var(--color-orchid)",
};

export const FILL_SWATCHES: { id: ShapeFill; label: string }[] = [
  { id: "paper", label: "Paper" },
  { id: "surface", label: "Surface" },
  { id: "coral", label: "Coral" },
  { id: "lagoon", label: "Lagoon" },
  { id: "mint", label: "Mint" },
  { id: "orchid", label: "Orchid" },
];

export const HEX: Record<ShapeFill | ShapeStroke, string> = {
  paper: "#fffdfe",
  surface: "#f4ecf1",
  ink: "#2a1220",
  coral: "#f39083",
  lagoon: "#5eb3ca",
  mint: "#84d5aa",
  orchid: "#ba4ba5",
};

export const STROKE_SWATCHES: { id: ShapeStroke; label: string }[] = [
  { id: "ink", label: "Ink" },
  { id: "coral", label: "Coral" },
  { id: "lagoon", label: "Lagoon" },
  { id: "mint", label: "Mint" },
  { id: "orchid", label: "Orchid" },
];
