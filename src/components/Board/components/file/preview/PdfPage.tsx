export function PdfPage({ src }: { src: string }) {
  return (
    <iframe
      title="First page"
      src={`${src}#page=1&toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
      className="h-[72vh] w-full bg-white"
    />
  );
}
