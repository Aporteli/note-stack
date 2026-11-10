import { NoteCard } from "@/components/Board/components/note/NoteCard";
import type { NoteData } from "@/components/Board/types/note";

type Drag = { dx: number; dy: number; ids: ReadonlySet<string> };

type Props = {
  boardId: string;
  notes: NoteData[];
  selectedItemKeys: Set<string>;
  noteDrag: Drag | null;
  onText: (id: string, text: string) => void;
  onResize: (id: string, w: number, h: number) => void;
  onStartDrag: (id: string, clientX: number, clientY: number, shift: boolean) => void;
  onDelete: (id: string) => void;
  onCreated: (note: NoteData) => void;
  onLock: (id: string, locked: boolean) => void;
  onFront: (id: string) => void;
  onBack: (id: string) => void;
  onSelect: (id: string) => void;
};

export function NotesLayer({
  boardId,
  notes,
  selectedItemKeys,
  noteDrag,
  onText,
  onResize,
  onStartDrag,
  onDelete,
  onCreated,
  onLock,
  onFront,
  onBack,
  onSelect,
}: Props) {
  return notes.map((note) => (
    <NoteCard
      key={note.key}
      boardId={boardId}
      note={note}
      selected={selectedItemKeys.has(`note:${note.id}`)}
      dragOffset={
        noteDrag?.ids.has(note.id) ? { dx: noteDrag.dx, dy: noteDrag.dy } : null
      }
      onText={onText}
      onResize={onResize}
      onStartDrag={onStartDrag}
      onDelete={onDelete}
      onCreated={onCreated}
      onLock={onLock}
      onFront={() => onFront(note.id)}
      onBack={() => onBack(note.id)}
      onSelect={() => onSelect(note.id)}
    />
  ));
}
