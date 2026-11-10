import { PageIcon } from "@/components/Board/components/file/icons/PageIcon";

export function GenericFileIcon() {
  return (
    <PageIcon
      mark={
        <>
          <path d="M14 32h26M14 40h20M14 48h16" stroke="#94a3b8" strokeWidth="2" />
        </>
      }
    />
  );
}
