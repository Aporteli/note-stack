import { HEX } from "@/components/diagram/colors";
import { connectorPath } from "@/components/diagram/lib/connectorPath";
import { cylinderPaths } from "@/components/diagram/lib/cylinderPaths";
import { dashArray } from "@/components/diagram/lib/dashArray";
import { escapeXml } from "@/components/diagram/lib/escapeXml";
import { polygonPoints } from "@/components/diagram/lib/polygonPoints";
import { strokePaint } from "@/components/diagram/lib/strokePaint";
import type { DiagramDocument, DiagramShape } from "@/components/diagram/types";

function shapeMarkup(shape: DiagramShape): string {
  const fill = shape.kind === "text" ? "none" : HEX[shape.fill];
  const stroke = HEX[shape.stroke];
  const width = strokePaint(shape.weight);
  const dash = dashArray(shape.dashed);
  const dashAttr = dash ? ` stroke-dasharray="${dash}"` : "";
  const common = `fill="${fill}" stroke="${stroke}" stroke-width="${width}"${dashAttr}`;
  const points = polygonPoints(shape);
  let body = "";
  if (shape.kind === "ellipse") {
    body = `<ellipse cx="${shape.x + shape.w / 2}" cy="${shape.y + shape.h / 2}" rx="${shape.w / 2}" ry="${shape.h / 2}" ${common}/>`;
  } else if (shape.kind === "cylinder") {
    const paths = cylinderPaths(shape);
    body = `<path d="${paths.body}" ${common}/><path d="${paths.cap}" fill="none" stroke="${stroke}" stroke-width="${width}"${dashAttr}/>`;
  } else if (points) {
    body = `<polygon points="${points}" ${common}/>`;
  } else if (shape.kind !== "text") {
    const radius = shape.kind === "round" ? 16 : 0;
    body = `<rect x="${shape.x}" y="${shape.y}" width="${shape.w}" height="${shape.h}" rx="${radius}" ${common}/>`;
  }
  if (!shape.text) return body;
  const weight = shape.bold ? 700 : 500;
  const lines = shape.text.split("\n").slice(0, 6);
  const start = shape.y + shape.h / 2 - ((lines.length - 1) * 16) / 2;
  const tspans = lines
    .map((line, index) => `<tspan x="${shape.x + shape.w / 2}" y="${start + index * 16}">${escapeXml(line)}</tspan>`)
    .join("");
  return `${body}<text text-anchor="middle" font-family="Public Sans, sans-serif" font-size="14" font-weight="${weight}" fill="${stroke}">${tspans}</text>`;
}

export function diagramSvg(document: DiagramDocument): string {
  const shapes = document.shapes;
  let minX = 0;
  let minY = 0;
  let maxX = 640;
  let maxY = 360;
  if (shapes.length) {
    minX = Math.min(...shapes.map((shape) => shape.x));
    minY = Math.min(...shapes.map((shape) => shape.y));
    maxX = Math.max(...shapes.map((shape) => shape.x + shape.w));
    maxY = Math.max(...shapes.map((shape) => shape.y + shape.h));
  }
  const pad = 48;
  const width = Math.max(1, Math.ceil(maxX - minX + pad * 2));
  const height = Math.max(1, Math.ceil(maxY - minY + pad * 2));
  const links = document.connectors
    .map((connector) => {
      const from = shapes.find((shape) => shape.id === connector.fromId);
      const to = shapes.find((shape) => shape.id === connector.toId);
      if (!from || !to) return "";
      const dash = dashArray(connector.dashed);
      const start = connector.arrow === "start" || connector.arrow === "both" ? ' marker-start="url(#arrow)"' : "";
      const end = connector.arrow === "end" || connector.arrow === "both" ? ' marker-end="url(#arrow)"' : "";
      return `<path d="${connectorPath(connector, from, to)}" fill="none" stroke="${HEX.ink}" stroke-width="${strokePaint(connector.weight)}"${dash ? ` stroke-dasharray="${dash}"` : ""}${start}${end}/>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto">
      <path d="M0 0 L10 5 L0 10 Z" fill="${HEX.ink}"/>
    </marker>
  </defs>
  <rect width="100%" height="100%" fill="${HEX.paper}"/>
  <g transform="translate(${pad - minX} ${pad - minY})">
    ${links}
    ${shapes.map(shapeMarkup).join("")}
  </g>
</svg>`;
}
