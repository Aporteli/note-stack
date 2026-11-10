import { OptionGroup } from "@/components/diagram/editor/OptionGroup";
import { ToolbarDivider } from "@/components/diagram/editor/toolbar/ToolbarDivider";
import { ARROWS, LINE_WEIGHTS, ROUTES, type ArrowKind, type DiagramConnector, type LineWeight, type Route } from "@/components/diagram/types";

const ROUTE_OPTIONS = ROUTES.map((id) => ({
  id,
  label: id === "elbow" ? "Elbow" : id === "straight" ? "Straight" : "Curve",
}));

const ARROW_OPTIONS = ARROWS.map((id) => ({
  id,
  label: id === "end" ? "End" : id === "start" ? "Start" : id === "both" ? "Both" : "None",
}));

const WEIGHTS = LINE_WEIGHTS.map((id) => ({
  id,
  label: id === "thin" ? "Thin" : id === "thick" ? "Thick" : "Medium",
}));

type Props = {
  connector: DiagramConnector;
  onRoute: (route: Route) => void;
  onArrow: (arrow: ArrowKind) => void;
  onDashed: (dashed: boolean) => void;
  onWeight: (weight: LineWeight) => void;
};

export function ConnectorTools({ connector, onRoute, onArrow, onDashed, onWeight }: Props) {
  return (
    <>
      <OptionGroup label="Route" value={connector.route} options={ROUTE_OPTIONS} onChange={onRoute} />
      <ToolbarDivider />
      <OptionGroup label="Arrow" value={connector.arrow} options={ARROW_OPTIONS} onChange={onArrow} />
      <ToolbarDivider />
      <OptionGroup
        label=""
        value={connector.dashed ? "dashed" : "solid"}
        options={[
          { id: "solid", label: "Solid" },
          { id: "dashed", label: "Dashed" },
        ]}
        onChange={(id) => onDashed(id === "dashed")}
      />
      <ToolbarDivider />
      <OptionGroup label="" value={connector.weight} options={WEIGHTS} onChange={onWeight} />
    </>
  );
}
