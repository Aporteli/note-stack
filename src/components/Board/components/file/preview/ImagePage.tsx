export function ImagePage({ src }: { src: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-white p-8">
      <img src={src} alt="" className="max-h-[68vh] max-w-full object-contain" />
    </div>
  );
}
