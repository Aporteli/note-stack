"use client";

import { useState } from "react";
import type { RefObject } from "react";

export function useMediaPlayer(ref: RefObject<HTMLMediaElement | null>) {
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  function toggle() {
    const media = ref.current;
    if (!media) return;
    if (media.paused) {
      void media.play();
      setPlaying(true);
    } else {
      media.pause();
      setPlaying(false);
    }
  }

  function seek(next: number) {
    const media = ref.current;
    if (!media) return;
    media.currentTime = next;
    setTime(next);
  }

  return {
    playing,
    time,
    duration,
    toggle,
    seek,
    onTime: () => setTime(ref.current?.currentTime ?? 0),
    onMeta: () => setDuration(Number.isFinite(ref.current?.duration) ? ref.current?.duration ?? 0 : 0),
    onEnded: () => setPlaying(false),
  };
}
