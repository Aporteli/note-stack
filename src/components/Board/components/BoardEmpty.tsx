import { AddList } from "./AddList";
import { EmptyState } from "@/components/ui/Feedback";

type Props = {
  boardId: string;
  addListOpen: boolean;
  onAddListClose: () => void;
};

export function BoardEmpty({
  boardId,
  addListOpen,
  onAddListClose,
}: Props) {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {addListOpen ? (
          <AddList boardId={boardId} onClose={onAddListClose} />
        ) : (
          <EmptyState
            onCanvas
            title="This board is empty"
            body='Click "Add list" in the header to create the first stage — Ideas, Drafting, Done.'
          />
        )}
      </div>
    </div>
  );
}