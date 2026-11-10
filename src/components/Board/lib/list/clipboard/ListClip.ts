export type ListClip = {
  cut: boolean;
  title: string;
  w: number;
  h: number;
  cards: { title: string; image?: string | null }[];
};

let clip: ListClip | null = null;

export function writeListClip(value: ListClip) {
  clip = value;
}

export function readListClip() {
  return clip;
}

export function clearCutClip() {
  if (clip?.cut) clip = null;
}
