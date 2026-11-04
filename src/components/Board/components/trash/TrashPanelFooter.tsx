import { Button } from "@/components/ui/Button";

type Props = {
  selectedCount: number;
  busy: boolean;
  onRestore: () => void;
  onPurge: () => void;
};

export function TrashPanelFooter({ selectedCount, busy, onRestore, onPurge }: Props) {
  return (
    <footer className="flex items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2">
      <Button variant="ghost" size="sm" disabled={selectedCount === 0 || busy} onClick={onRestore}>
        Restore {selectedCount > 0 ? `(${selectedCount})` : ""}
      </Button>
      <Button variant="danger" size="sm" disabled={busy} onClick={onPurge}>
        {selectedCount > 0 ? `Delete (${selectedCount})` : "Empty trash"}
      </Button>
    </footer>
  );
}
