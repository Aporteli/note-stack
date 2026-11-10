import { ToolbarGroup } from "@/components/diagram/editor/toolbar/ToolbarGroup";
import { ToolbarRow } from "@/components/diagram/editor/toolbar/ToolbarRow";
import { toolbarBands, type ToolbarInput } from "@/components/diagram/editor/toolbar/toolbarBands";

export function DiagramToolbar(props: ToolbarInput) {
  return (
    <div className="border-b border-line">
      {toolbarBands(props).map((band, index) => (
        <div key={band.id} className={index > 0 ? "border-t border-line" : undefined}>
          <ToolbarRow>
            {band.groups.map((group) => (
              <ToolbarGroup key={group.id} label={group.label}>
                {group.node}
              </ToolbarGroup>
            ))}
          </ToolbarRow>
        </div>
      ))}
    </div>
  );
}
