"use client";

import { useRef, type RefObject } from "react";
import { PlayPauseButton } from "@/components/Board/components/file/PlayPauseButton";
import { SeekBar } from "@/components/Board/components/file/SeekBar";
import { useMediaPlayer } from "@/components/Board/hooks/useMediaPlayer";

type Props = {
  src: string;
  kind: "audio" | "video";
};

export function MediaControls({ src, kind }: Props) {
  const ref = useRef<HTMLMediaElement>(null);
  const player = useMediaPlayer(ref);

  return (
    <div data-file-control className="mt-2 w-full" onPointerDown={(event) => event.stopPropagation()}>
      {kind === "video" ? (
        <video
          ref={ref as RefObject<HTMLVideoElement>}
          src={src}
          preload="metadata"
          className="mb-2 max-h-36 w-full bg-black"
          onTimeUpdate={player.onTime}
          onLoadedMetadata={player.onMeta}
          onEnded={player.onEnded}
          onPointerDown={(event) => event.stopPropagation()}
        />
      ) : (
        <audio
          ref={ref as RefObject<HTMLAudioElement>}
          src={src}
          preload="metadata"
          onTimeUpdate={player.onTime}
          onLoadedMetadata={player.onMeta}
          onEnded={player.onEnded}
        />
      )}
      <div className="flex items-center gap-2">
        <PlayPauseButton playing={player.playing} onToggle={player.toggle} />
        <SeekBar time={player.time} duration={player.duration} onSeek={player.seek} />
      </div>
    </div>
  );
}
