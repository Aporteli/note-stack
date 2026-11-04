import type { TrashItem } from "@/components/Board/types/board";
import { trashItemDetail } from "@/components/Board/lib/trash";

type Props = {
  item: TrashItem;
  checked: boolean;
  onToggle: (item: TrashItem) => void;
};

export function TrashItemRow({ item, checked, onToggle }: Props) {
  return (
    <label className="flex cursor-pointer items-center gap-3 px-4 py-2 hover:bg-slate-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(item)}
        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-slate-800">{item.title}</p>
        <p className="truncate text-xs text-slate-500">{trashItemDetail(item)}</p>
      </div>
    </label>
  );
}
