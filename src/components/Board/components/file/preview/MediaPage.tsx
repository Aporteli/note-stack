export function MediaPage({ src, kind }: { src: string; kind: "audio" | "video" }) {
  if (kind === "video") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-black">
        <video src={src} controls className="max-h-[68vh] w-full" />
      </div>
    );
  }
  return (
    <div className="flex min-h-[24vh] items-center justify-center bg-white px-10">
      <audio src={src} controls className="w-full" />
    </div>
  );
}
