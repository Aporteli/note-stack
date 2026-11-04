import { IconTrash } from "@/components/ui/Icons";

type Props = {
  total: number;
  selectedCount: number;
  onToggleAll: () => void;
};

export function TrashPanelHeader({ total, selectedCount, onToggleAll }: Props) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
      <div className="flex items-center gap-2">
        <IconTrash size={16} className="text-slate-600" />
        <h3 className="text-sm font-semibold text-slate-900">Trash</h3>
        {total > 0 ? (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {total}
          </span>
        ) : null}
      </div>
      {total > 0 ? (
        <button
          type="button"
          onClick={onToggleAll}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          {selectedCount === total ? "Deselect all" : "Select all"}
        </button>
      ) : null}
    </header>
  );
}
