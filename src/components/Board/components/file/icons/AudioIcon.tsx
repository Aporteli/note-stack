import { PageIcon } from "@/components/Board/components/file/icons/PageIcon";

export function AudioIcon() {
  return (
    <PageIcon
      mark={
        <>
          <path d="M22 28v16l12-4V24L22 28z" fill="#7c3aed" />
          <path d="M36 30a6 6 0 0 1 0 12" fill="none" stroke="#7c3aed" strokeWidth="2" />
        </>
      }
    />
  );
}
