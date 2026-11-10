type Props = {
  time: number;
  duration: number;
  onSeek: (time: number) => void;
};

export function SeekBar({ time, duration, onSeek }: Props) {
  return (
    <input
      data-file-control
      type="range"
      min={0}
      max={duration || 0}
      step={0.1}
      value={Math.min(time, duration || 0)}
      aria-label="Seek"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      onChange={(event) => onSeek(Number(event.target.value))}
      className="w-full"
    />
  );
}
