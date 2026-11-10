/** Preview that follows the cursor while dragging an existing list. */
export function ListDragPreview({ title }: { title: string }) {
  return (
    <div className=" shrink-0 border-2 border-slate-800 bg-white p-2.5 shadow-lift-3">
      <header className="flex items-center gap-2 px-1.5">
        <h3 className="text-body font-semibold text-slate-900">{title}</h3>
      </header>
    </div>
  );
}
