export type NoteClip = {
  cut: boolean;
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

let clip: NoteClip | null = null;

export function writeNoteClip(value: NoteClip) {
  clip = value;
}

export function readNoteClip() {
  return clip;
}

export function clearCutNote() {
  if (clip?.cut) clip = null;
}
