import { PageIcon } from "@/components/Board/components/file/icons/PageIcon";

export function ImageIcon() {
  return (
    <PageIcon
      mark={
        <>
          <circle cx="18" cy="30" r="3" fill="#f59e0b" />
          <path d="M10 48l10-10 6 6 8-12 10 16H10z" fill="#38bdf8" />
        </>
      }
    />
  );
}
