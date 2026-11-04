import type { Metadata } from "next";
import { OutlineTool } from "@/components/Board/components/document/outline/OutlineTool";

export const metadata: Metadata = {
  title: "Outline · Note-Stack",
  description: "Turn main topics into a numbered hierarchy.",
};

export default function OutlinePage() {
  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-paper text-ink">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <OutlineTool />
      </div>
    </main>
  );
}
