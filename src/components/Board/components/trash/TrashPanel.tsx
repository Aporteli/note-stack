import type { RefObject } from "react";
import type { TrashItem } from "@/components/Board/types/board";
import { itemKey } from "@/components/Board/types/board";
import { TrashItemRow } from "@/components/Board/components/trash/TrashItemRow";
import { TrashPanelFooter } from "@/components/Board/components/trash/TrashPanelFooter";
import { TrashPanelHeader } from "@/components/Board/components/trash/TrashPanelHeader";

type Props = {
  panelRef: RefObject<HTMLDivElement | null>;
  loading: boolean;
  total: number;
  items: TrashItem[];
  selected: Set<string>;
  error: string | null;
  busy: boolean;
  onToggleAll: () => void;
  onToggle: (item: TrashItem) => void;
  onRestore: () => void;
  onPurge: () => void;
};

export function TrashPanel({
  panelRef,
  loading,
  total,
  items,
  selected,
  error,
  busy,
  onToggleAll,
  onToggle,
  onRestore,
  onPurge,
}: Props) {
  return (
    <div
      ref={panelRef}
      role="menu"
      style={{
        position: "fixed",
        right: 16,
        top: 116,
        width: 340,
      }}
      className="z-[160] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10"
    >
      <TrashPanelHeader total={total} selectedCount={selected.size} onToggleAll={onToggleAll} />

      <div className="max-h-[50vh] overflow-y-auto py-1">
        {loading ? (
          <p className="px-4 py-6 text-center text-sm text-slate-500">Loading…</p>
        ) : null}

        {!loading && total === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">Trash is empty.</p>
        ) : null}

        {!loading
          ? items.map((item) => (
              <TrashItemRow
                key={itemKey(item)}
                item={item}
                checked={selected.has(itemKey(item))}
                onToggle={onToggle}
              />
            ))
          : null}
      </div>

      {error ? (
        <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      {total > 0 ? (
        <TrashPanelFooter
          selectedCount={selected.size}
          busy={busy}
          onRestore={onRestore}
          onPurge={onPurge}
        />
      ) : null}
    </div>
  );
}
