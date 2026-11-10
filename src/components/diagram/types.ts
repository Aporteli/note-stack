export const SHAPE_KINDS = ["rect", "round", "ellipse", "diamond", "hex", "cylinder", "slant", "text"] as const;
export const SIDES = ["top", "right", "bottom", "left"] as const;
export const FILLS = ["paper", "surface", "coral", "lagoon", "mint", "orchid"] as const;
export const STROKES = ["ink", "coral", "lagoon", "mint", "orchid"] as const;
export const CORNERS = ["nw", "ne", "sw", "se"] as const;
export const LINE_WEIGHTS = ["thin", "medium", "thick"] as const;
export const ROUTES = ["elbow", "straight", "curve"] as const;
export const ARROWS = ["end", "start", "both", "none"] as const;
export const ALIGNS = ["left", "center", "right", "top", "middle", "bottom"] as const;

export type ShapeKind = (typeof SHAPE_KINDS)[number];
export type Side = (typeof SIDES)[number];
export type ShapeFill = (typeof FILLS)[number];
export type ShapeStroke = (typeof STROKES)[number];
export type Corner = (typeof CORNERS)[number];
export type LineWeight = (typeof LINE_WEIGHTS)[number];
export type Route = (typeof ROUTES)[number];
export type ArrowKind = (typeof ARROWS)[number];
export type AlignMode = (typeof ALIGNS)[number];
export type Tool = "select" | ShapeKind;

export type Point = { x: number; y: number };

export type Box = { x: number; y: number; w: number; h: number };

export type DiagramShape = {
  id: string;
  kind: ShapeKind;
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  fill: ShapeFill;
  stroke: ShapeStroke;
  dashed: boolean;
  weight: LineWeight;
  bold: boolean;
};

export type DiagramConnector = {
  id: string;
  fromId: string;
  fromSide: Side;
  toId: string;
  toSide: Side;
  route: Route;
  arrow: ArrowKind;
  dashed: boolean;
  weight: LineWeight;
};

export type DiagramDocument = {
  shapes: DiagramShape[];
  connectors: DiagramConnector[];
};

export type DiagramSummary = {
  id: string;
  title: string;
  updatedAt: string;
};

export type DiagramRecord = DiagramSummary & {
  document: DiagramDocument;
};

export type Selection = {
  shapeIds: string[];
  connectorId: string | null;
};

export type View = { x: number; y: number; zoom: number };
