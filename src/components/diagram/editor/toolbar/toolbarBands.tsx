import type { ReactNode } from "react";
import { ArrangeTools } from "@/components/diagram/editor/toolbar/ArrangeTools";
import { ConnectorTools } from "@/components/diagram/editor/toolbar/ConnectorTools";
import { EditTools } from "@/components/diagram/editor/toolbar/EditTools";
import { ShapeTools } from "@/components/diagram/editor/toolbar/ShapeTools";
import { StyleTools } from "@/components/diagram/editor/toolbar/StyleTools";
import type {
  AlignMode,
  ArrowKind,
  DiagramConnector,
  DiagramShape,
  LineWeight,
  Route,
  ShapeFill,
  ShapeStroke,
  Tool,
} from "@/components/diagram/types";

export type ToolbarBand = {
  id: string;
  groups: { id: string; label: string; node: ReactNode }[];
};

export type ToolbarInput = {
  tool: Tool;
  shape: DiagramShape | null;
  shapeCount: number;
  connector: DiagramConnector | null;
  canUndo: boolean;
  canRedo: boolean;
  onTool: (tool: Tool) => void;
  onFill: (fill: ShapeFill) => void;
  onStroke: (stroke: ShapeStroke) => void;
  onDashed: (dashed: boolean) => void;
  onWeight: (weight: LineWeight) => void;
  onBold: () => void;
  onRoute: (route: Route) => void;
  onArrow: (arrow: ArrowKind) => void;
  onAlign: (mode: AlignMode) => void;
  onDuplicate: () => void;
  onFront: () => void;
  onBack: () => void;
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
};

export function toolbarBands(input: ToolbarInput): ToolbarBand[] {
  const selection: ToolbarBand["groups"] = [];
  if (input.shape) {
    selection.push({
      id: "arrange",
      label: "Arrange",
      node: (
        <ArrangeTools
          shapeCount={input.shapeCount}
          onFront={input.onFront}
          onBack={input.onBack}
          onAlign={input.onAlign}
        />
      ),
    });
    selection.push({
      id: "style",
      label: "Style",
      node: (
        <StyleTools
          shape={input.shape}
          onFill={input.onFill}
          onStroke={input.onStroke}
          onDashed={input.onDashed}
          onWeight={input.onWeight}
          onBold={input.onBold}
        />
      ),
    });
  }
  if (input.connector) {
    selection.push({
      id: "connector",
      label: "Connector",
      node: (
        <ConnectorTools
          connector={input.connector}
          onRoute={input.onRoute}
          onArrow={input.onArrow}
          onDashed={input.onDashed}
          onWeight={input.onWeight}
        />
      ),
    });
  }

  return [
    {
      id: "main",
      groups: [
        { id: "shapes", label: "Shapes", node: <ShapeTools tool={input.tool} onTool={input.onTool} /> },
        {
          id: "edit",
          label: "Edit",
          node: (
            <EditTools
              canUndo={input.canUndo}
              canRedo={input.canRedo}
              canDuplicate={Boolean(input.shape)}
              canDelete={Boolean(input.shape || input.connector)}
              onUndo={input.onUndo}
              onRedo={input.onRedo}
              onDuplicate={input.onDuplicate}
              onDelete={input.onDelete}
              onExport={input.onExport}
            />
          ),
        },
      ],
    },
    { id: "selection", groups: selection },
  ].filter((band) => band.groups.length > 0);
}
