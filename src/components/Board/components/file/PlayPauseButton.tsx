type Props = {
  playing: boolean;
  onToggle: () => void;
};

export function PlayPauseButton({ playing, onToggle }: Props) {
  return (
    <button
      type="button"
      data-file-control
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      className="h-7 shrink-0 bg-slate-900 px-2 text-xs text-white"
    >
      {playing ? "Pause" : "Play"}
    </button>
  );
}
