/** Preview that follows the cursor while dragging the Add-list button. */
export function NewListPreview() {
  return (
    <div className="w-[296px] shrink-0 border-2 border-slate-800 bg-white p-2.5 shadow-lift-3">
      <header className="flex items-center gap-2 px-1.5 pb-2">
        <h3 className="text-body font-semibold text-slate-500">New list</h3>
        <span className="bg-slate-100 px-1.5 text-micro font-semibold text-slate-500">0</span>
      </header>
      <div className="mx-0.5 grid h-16 place-items-center border-2 border-dashed border-slate-200 text-meta text-slate-400">
        Drop to create
      </div>
    </div>
  );
}
