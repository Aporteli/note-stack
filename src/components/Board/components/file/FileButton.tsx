"use client";

type Props = {
  onFiles: (files: FileList) => void;
};

export function FileButton({ onFiles }: Props) {
  return (
    <label
      title="Upload a file, picture, audio, or video"
      className="
        inline-flex h-9 cursor-pointer items-center gap-1.5
        bg-white px-3 text-sm font-medium text-slate-700
        shadow-sm ring-1 ring-slate-200
        hover:bg-slate-50 hover:shadow
      "
    >
      <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M5 3.5h6.2L15.5 7.8V16.5h-10.5V3.5z" />
        <path d="M11 3.7V8h4.2" />
      </svg>
      <span>File</span>
      <input
        type="file"
        multiple
        className="sr-only"
        onChange={(event) => {
          const list = event.target.files;
          if (list && list.length > 0) onFiles(list);
          event.target.value = "";
        }}
      />
    </label>
  );
}
