import type { LinkData } from "@/components/Board/types/link";

function label(url: string) {
  return url.replace(/\/$/, "");
}

export function LinkPreviewCard({ link }: { link: LinkData }) {
  return (
    <div>
      {link.image ? (
        <img
          src={link.image}
          alt=""
          className="max-h-44 w-full bg-white object-contain"
          referrerPolicy="no-referrer"
        />
      ) : null}
      <div className="space-y-1.5 px-3 py-3">
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          {link.icon ? (
            <img src={link.icon} alt="" className="h-4 w-4" referrerPolicy="no-referrer" />
          ) : null}
          <span className="truncate">{label(link.url)}</span>
        </p>
        {link.title ? <p className="text-sm font-semibold text-[#e4572e]">{link.title}</p> : null}
        {link.description ? (
          <p className="line-clamp-4 text-[13px] leading-5 text-slate-600">{link.description}</p>
        ) : null}
      </div>
    </div>
  );
}
