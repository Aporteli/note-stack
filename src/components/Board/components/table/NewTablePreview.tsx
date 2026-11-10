export function NewTablePreview() {
  return (
    <div className="w-56 border-2 border-slate-800 bg-white shadow-lg">
      <div className="grid grid-cols-4 border-b border-slate-300 text-center text-[10px] text-slate-400">
        <span className="py-1">A</span>
        <span className="border-l border-slate-300 py-1">B</span>
        <span className="border-l border-slate-300 py-1">C</span>
        <span className="border-l border-slate-300 py-1">D</span>
      </div>
      <div className="h-6 bg-slate-300" />
      <div className="h-6 border-t border-slate-300" />
      <div className="h-6 border-t border-slate-300" />
    </div>
  );
}
