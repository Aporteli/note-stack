import { formatBytes } from "@/lib/files/formatBytes";

type Props = {
  name: string;
  size: number;
};

export function FileLabel({ name, size }: Props) {
  return (
    <div className="mt-2 w-full px-1 text-center">
      <p className="break-words text-[13px] leading-4 text-slate-800">{name}</p>
      <p className="mt-1 text-xs text-slate-400">{formatBytes(size)}</p>
    </div>
  );
}
