import { Button } from "@/components/ui/Button";
import { IconCheck } from "@/components/ui/Icons";

type Props = {
  onClose: () => void;
  onSave: () => void;
};

export function DocumentModalFooter({ onClose, onSave }: Props) {
  return (
    <footer className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
      <Button variant="ghost" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="primary" onClick={onSave}>
        <IconCheck size={16} />
        Save document
      </Button>
    </footer>
  );
}
