import type { ReactNode } from "react";

type Props = {
  mark: ReactNode;
};

export function PageIcon({ mark }: Props) {
  return (
    <svg width="54" height="66" viewBox="0 0 54 66" aria-hidden="true">
      <path d="M6 2h28l14 14v46a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z" fill="#fff" stroke="#d6d3d1" />
      <path d="M34 2v12a2 2 0 0 0 2 2h12" fill="#f5f5f4" stroke="#d6d3d1" />
      {mark}
    </svg>
  );
}
